import { logger } from '../utils/logger';

const JINA_BASE = 'https://r.jina.ai/';
const JINA_API_KEY = process.env.JINA_API_KEY || '';
const TIMEOUT_MS = 12_000;
const MAX_CONTENT_CHARS = 80_000;
const USER_AGENT = 'Mozilla/5.0 (compatible; BayfillerBot/1.0)';

// Progress callback type
export interface ScrapeProgressEvent {
  step: 'connecting' | 'reading_homepage' | 'discovering_pages' | 'reading_subpage' | 'combining' | 'analyzing' | 'error';
  message: string;
  detail?: string;
  pagesFound?: string[];
  progress?: number;
}

export type ScrapeProgressCallback = (event: ScrapeProgressEvent) => void;

/** Patterns to match relevant subpage links for auto repair shops */
const SUBPAGE_PATTERNS = [
  /services/i, /specials/i, /offers/i, /about/i, /pricing/i,
  /repairs/i, /maintenance/i, /deals/i, /coupons/i, /promotions/i,
  /what-we-do/i, /our-work/i, /capabilities/i, /menu/i,
];

/** Common subpaths to probe even if not linked from homepage */
const COMMON_PATHS = [
  '/services', '/our-services', '/what-we-do',
  '/specials', '/offers', '/deals', '/coupons',
  '/about', '/about-us',
  '/pricing', '/prices',
];

/**
 * Fetch a single URL via Jina AI Reader, returning rendered markdown.
 * Handles JS-rendered sites (Wix, Squarespace, React, etc.)
 */
export async function fetchViaJina(url: string): Promise<string> {
  const jinaUrl = `${JINA_BASE}${url}`;
  const headers: Record<string, string> = {
    Accept: 'text/markdown',
  };
  if (JINA_API_KEY) {
    headers['Authorization'] = `Bearer ${JINA_API_KEY}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const resp = await fetch(jinaUrl, { headers, signal: controller.signal });
    if (!resp.ok) {
      throw new Error(`Jina returned HTTP ${resp.status} for ${url}`);
    }
    const text = await resp.text();
    if (!text || text.trim().length < 50) {
      throw new Error(`No meaningful content returned for ${url}`);
    }
    return text;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error(`Timed out reading ${url}`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Discover relevant subpage URLs from homepage markdown.
 * Looks for markdown links [text](url) matching auto repair patterns.
 */
export function discoverSubpages(markdown: string, baseUrl: string): string[] {
  const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
  const found = new Set<string>();
  let match: RegExpExecArray | null;
  let baseHostname: string;

  try {
    baseHostname = new URL(baseUrl).hostname;
  } catch {
    return [];
  }

  while ((match = linkRegex.exec(markdown)) !== null) {
    const linkText = match[1];
    const href = match[2];
    const combinedText = `${linkText} ${href}`.toLowerCase();

    if (SUBPAGE_PATTERNS.some(p => p.test(combinedText))) {
      try {
        const resolved = new URL(href, baseUrl).href;
        // Only follow links on the same domain
        if (new URL(resolved).hostname === baseHostname) {
          // Skip anchors, mailto, tel, and the homepage itself
          const resolvedUrl = new URL(resolved);
          if (resolvedUrl.pathname !== '/' && resolvedUrl.pathname !== '') {
            found.add(resolved);
          }
        }
      } catch { /* skip malformed URLs */ }
    }
  }

  return [...found].slice(0, 5);
}

/**
 * Probe common auto repair website paths via HEAD requests.
 * Returns URLs that respond with HTTP 200.
 */
export async function probeCommonPaths(baseUrl: string): Promise<string[]> {
  let origin: string;
  try {
    origin = new URL(baseUrl).origin;
  } catch {
    return [];
  }

  const results: string[] = [];

  // Run all HEAD requests in parallel for speed
  const checks = COMMON_PATHS.map(async (path) => {
    const url = `${origin}${path}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const resp = await fetch(url, {
        method: 'HEAD',
        headers: { 'User-Agent': USER_AGENT },
        signal: controller.signal,
        redirect: 'follow',
      });
      if (resp.ok) {
        return url;
      }
    } catch {
      // Path doesn't exist or timed out — skip
    } finally {
      clearTimeout(timeout);
    }
    return null;
  });

  const resolved = await Promise.all(checks);
  for (const url of resolved) {
    if (url) results.push(url);
  }

  return results;
}

/**
 * Full multi-page scrape with progress callbacks.
 * Two-pronged discovery: parse homepage links + probe common paths.
 */
export async function scrapeWebsite(
  rawUrl: string,
  onProgress: ScrapeProgressCallback
): Promise<string> {
  // 1. Normalize URL
  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  // 2. Fetch homepage
  onProgress({ step: 'connecting', message: 'Connecting to your website...', progress: 5 });

  let homepageMarkdown: string;
  try {
    homepageMarkdown = await fetchViaJina(url);
  } catch (err: any) {
    // Fallback: try direct fetch (for simple SSR sites where Jina might be down)
    logger.warn('Jina Reader failed, trying direct fetch', { url, error: err.message });
    onProgress({ step: 'connecting', message: 'Trying alternate connection...', progress: 8 });
    try {
      homepageMarkdown = await fetchDirectFallback(url);
    } catch (fallbackErr: any) {
      throw new Error(`Could not reach ${url}: ${fallbackErr.message}`);
    }
  }

  onProgress({ step: 'reading_homepage', message: 'Reading your homepage...', progress: 20 });

  // 3. Two-pronged page discovery
  onProgress({ step: 'discovering_pages', message: 'Scanning for services & specials pages...', progress: 28 });

  // 3a. Discover from homepage links
  const discoveredLinks = discoverSubpages(homepageMarkdown, url);

  // 3b. Probe common paths (runs in parallel, fast HEAD requests)
  let probedPaths: string[] = [];
  try {
    probedPaths = await probeCommonPaths(url);
  } catch {
    // Non-critical, continue without probed paths
  }

  // 3c. Merge and deduplicate
  const allSubpageUrls = new Set<string>();
  for (const u of [...discoveredLinks, ...probedPaths]) {
    // Normalize for dedup
    try {
      const normalized = new URL(u);
      normalized.hash = '';
      normalized.search = '';
      // Skip if it's the same as the homepage
      const homeNorm = new URL(url);
      homeNorm.hash = '';
      homeNorm.search = '';
      if (normalized.href !== homeNorm.href) {
        allSubpageUrls.add(normalized.href);
      }
    } catch { /* skip */ }
  }

  const subpages = [...allSubpageUrls].slice(0, 5);

  if (subpages.length > 0) {
    const paths = subpages.map(u => {
      try { return new URL(u).pathname; } catch { return u; }
    });
    onProgress({
      step: 'discovering_pages',
      message: `Found ${subpages.length} page${subpages.length > 1 ? 's' : ''} to explore`,
      pagesFound: paths,
      progress: 32,
    });
  } else {
    onProgress({
      step: 'discovering_pages',
      message: 'No subpages found — extracting from homepage',
      progress: 32,
    });
  }

  // 4. Fetch subpages via Jina — in parallel for speed
  const allMarkdown = [homepageMarkdown];

  if (subpages.length > 0) {
    onProgress({
      step: 'reading_subpage',
      message: `Reading ${subpages.length} pages in parallel...`,
      progress: 35,
    });

    const subpageResults = await Promise.allSettled(
      subpages.map(async (subUrl) => {
        let pagePath: string;
        try { pagePath = new URL(subUrl).pathname; } catch { pagePath = subUrl; }

        onProgress({
          step: 'reading_subpage',
          message: `Reading ${pagePath}...`,
          detail: pagePath,
          progress: 40,
        });

        const md = await fetchViaJina(subUrl);
        return { pagePath, md };
      })
    );

    for (const result of subpageResults) {
      if (result.status === 'fulfilled') {
        allMarkdown.push(`\n\n--- Page: ${result.value.pagePath} ---\n\n${result.value.md}`);
      } else {
        logger.warn('Failed to fetch subpage', { error: result.reason?.message });
      }
    }
  }

  // 5. Combine and truncate
  onProgress({ step: 'combining', message: 'Combining all page content...', progress: 70 });
  let combined = allMarkdown.join('\n\n');
  if (combined.length > MAX_CONTENT_CHARS) {
    combined = combined.slice(0, MAX_CONTENT_CHARS);
    logger.info('Truncated combined content', { originalLength: combined.length, maxChars: MAX_CONTENT_CHARS });
  }

  onProgress({ step: 'analyzing', message: 'AI is analyzing your business info...', progress: 75 });

  return combined;
}

/**
 * Direct fetch fallback — basic HTML stripping for simple SSR sites.
 * Used when Jina Reader is unavailable.
 */
async function fetchDirectFallback(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
      redirect: 'follow',
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const html = await resp.text();

    // Basic tag stripping
    let text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
      .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
      .replace(/<header[\s\S]*?<\/header>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (text.length === 0) {
      throw new Error('No text content extracted');
    }
    return text;
  } finally {
    clearTimeout(timeout);
  }
}
