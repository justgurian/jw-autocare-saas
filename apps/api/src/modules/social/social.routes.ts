import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { prisma } from '../../db/client';
import { ValidationError } from '../../middleware/error.middleware';
import { logger } from '../../utils/logger';
import { config } from '../../config';
import axios from 'axios';

const router = Router();

router.use(authenticate);
router.use(tenantContext);

// Facebook App credentials (from environment)
const FB_APP_ID = process.env.FACEBOOK_APP_ID || '';
const FB_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';
const FB_REDIRECT_URI = `${config.apiUrl}/api/v1/social/facebook/callback`;

// ============================================================================
// GET CONNECTED ACCOUNTS
// ============================================================================

router.get('/accounts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accounts = await prisma.socialAccount.findMany({
      where: {
        tenantId: req.user!.tenantId,
        isActive: true,
      },
      select: {
        id: true,
        platform: true,
        accountName: true,
        accountUsername: true,
        accountAvatar: true,
        pageName: true,
        connectedAt: true,
      },
      orderBy: { connectedAt: 'desc' },
    });

    res.json({ accounts });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// FACEBOOK/INSTAGRAM OAUTH FLOW
// ============================================================================

// Step 1: Get OAuth URL
router.get('/facebook/auth-url', async (req: Request, res: Response) => {
  const state = Buffer.from(
    JSON.stringify({
      tenantId: req.user!.tenantId,
      userId: req.user!.id,
      timestamp: Date.now(),
    })
  ).toString('base64');

  // Request permissions for Facebook Pages and Instagram Business
  const scopes = [
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_posts',
    'instagram_basic',
    'instagram_content_publish',
    'business_management',
  ].join(',');

  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
    `client_id=${FB_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(FB_REDIRECT_URI)}` +
    `&scope=${scopes}` +
    `&state=${state}` +
    `&response_type=code`;

  res.json({ authUrl });
});

// Step 2: OAuth Callback (exchange code for token)
router.get('/facebook/callback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      logger.error('Facebook OAuth error', { error });
      res.redirect(`${config.webUrl}/settings/social?error=auth_failed`);
      return;
    }

    if (!code || !state) {
      res.redirect(`${config.webUrl}/settings/social?error=missing_params`);
      return;
    }

    // Decode state
    const stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
    const { tenantId, userId } = stateData;

    // Exchange code for access token
    const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: FB_APP_ID,
        client_secret: FB_APP_SECRET,
        redirect_uri: FB_REDIRECT_URI,
        code,
      },
    });

    const { access_token: shortLivedToken } = tokenResponse.data;

    // Exchange for long-lived token
    const longLivedResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: FB_APP_ID,
        client_secret: FB_APP_SECRET,
        fb_exchange_token: shortLivedToken,
      },
    });

    const { access_token: longLivedToken, expires_in } = longLivedResponse.data;
    const tokenExpiresAt = new Date(Date.now() + (expires_in || 5184000) * 1000);

    // Get user info
    const userResponse = await axios.get('https://graph.facebook.com/v18.0/me', {
      params: {
        access_token: longLivedToken,
        fields: 'id,name,picture',
      },
    });

    const fbUser = userResponse.data;

    // Get Facebook Pages
    const pagesResponse = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
      params: {
        access_token: longLivedToken,
        fields: 'id,name,access_token,instagram_business_account',
      },
    });

    const pages = pagesResponse.data.data || [];

    // Save the Facebook account
    await prisma.socialAccount.upsert({
      where: {
        tenantId_platform_accountId: {
          tenantId,
          platform: 'facebook',
          accountId: fbUser.id,
        },
      },
      update: {
        accountName: fbUser.name,
        accountAvatar: fbUser.picture?.data?.url,
        accessToken: longLivedToken,
        tokenExpiresAt,
        metadata: { pages: pages.map((p: any) => ({ id: p.id, name: p.name })) },
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        tenantId,
        platform: 'facebook',
        accountId: fbUser.id,
        accountName: fbUser.name,
        accountAvatar: fbUser.picture?.data?.url,
        accessToken: longLivedToken,
        tokenExpiresAt,
        metadata: { pages: pages.map((p: any) => ({ id: p.id, name: p.name })) },
      },
    });

    // Save each Facebook Page and associated Instagram account
    for (const page of pages) {
      // Save Facebook Page
      await prisma.socialAccount.upsert({
        where: {
          tenantId_platform_accountId: {
            tenantId,
            platform: 'facebook',
            accountId: `page_${page.id}`,
          },
        },
        update: {
          accountName: page.name,
          pageId: page.id,
          pageName: page.name,
          pageAccessToken: page.access_token,
          accessToken: longLivedToken,
          tokenExpiresAt,
          isActive: true,
        },
        create: {
          tenantId,
          platform: 'facebook',
          accountId: `page_${page.id}`,
          accountName: page.name,
          pageId: page.id,
          pageName: page.name,
          pageAccessToken: page.access_token,
          accessToken: longLivedToken,
          tokenExpiresAt,
        },
      });

      // If page has Instagram Business account, save it too
      if (page.instagram_business_account) {
        const igResponse = await axios.get(
          `https://graph.facebook.com/v18.0/${page.instagram_business_account.id}`,
          {
            params: {
              access_token: page.access_token,
              fields: 'id,username,name,profile_picture_url',
            },
          }
        );

        const igAccount = igResponse.data;

        await prisma.socialAccount.upsert({
          where: {
            tenantId_platform_accountId: {
              tenantId,
              platform: 'instagram',
              accountId: igAccount.id,
            },
          },
          update: {
            accountName: igAccount.name || igAccount.username,
            accountUsername: igAccount.username,
            accountAvatar: igAccount.profile_picture_url,
            pageId: page.id,
            pageName: page.name,
            pageAccessToken: page.access_token,
            accessToken: longLivedToken,
            tokenExpiresAt,
            isActive: true,
          },
          create: {
            tenantId,
            platform: 'instagram',
            accountId: igAccount.id,
            accountName: igAccount.name || igAccount.username,
            accountUsername: igAccount.username,
            accountAvatar: igAccount.profile_picture_url,
            pageId: page.id,
            pageName: page.name,
            pageAccessToken: page.access_token,
            accessToken: longLivedToken,
            tokenExpiresAt,
          },
        });
      }
    }

    logger.info('Facebook OAuth completed', { tenantId, pagesCount: pages.length });

    res.redirect(`${config.webUrl}/settings/social?success=connected`);
  } catch (error) {
    logger.error('Facebook OAuth callback failed', { error });
    res.redirect(`${config.webUrl}/settings/social?error=callback_failed`);
  }
});

// ============================================================================
// DISCONNECT ACCOUNT
// ============================================================================

router.delete('/accounts/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.socialAccount.updateMany({
      where: {
        id: req.params.id,
        tenantId: req.user!.tenantId,
      },
      data: { isActive: false },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// POST TO SOCIAL MEDIA (IMMEDIATE)
// ============================================================================

const postSchema = z.object({
  contentId: z.string().uuid(),
  accountIds: z.array(z.string().uuid()).min(1),
  caption: z.string().max(2200).optional(),
});

router.post('/post', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = postSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError('Validation failed');
    }

    const { contentId, accountIds, caption } = result.data;
    const tenantId = req.user!.tenantId;

    // Get the content
    const content = await prisma.content.findFirst({
      where: { id: contentId, tenantId },
    });

    if (!content || !content.imageUrl) {
      throw new ValidationError('Content not found or has no image');
    }

    // Get the social accounts
    const accounts = await prisma.socialAccount.findMany({
      where: {
        id: { in: accountIds },
        tenantId,
        isActive: true,
      },
    });

    const results: Array<{ accountId: string; platform: string; success: boolean; postUrl?: string; error?: string }> = [];

    for (const account of accounts) {
      try {
        const postCaption = caption || content.caption || '';

        if (account.platform === 'facebook' && account.pageId) {
          // Post to Facebook Page
          const postResult = await postToFacebookPage(
            account.pageAccessToken!,
            account.pageId,
            content.imageUrl,
            postCaption
          );
          results.push({
            accountId: account.id,
            platform: 'facebook',
            success: true,
            postUrl: postResult.postUrl,
          });

          // Log the scheduled post
          await prisma.scheduledPost.create({
            data: {
              tenantId,
              contentId,
              socialAccountId: account.id,
              caption: postCaption,
              status: 'posted',
              postId: postResult.postId,
              postUrl: postResult.postUrl,
              postedAt: new Date(),
            },
          });
        } else if (account.platform === 'instagram') {
          // Post to Instagram
          const postResult = await postToInstagram(
            account.pageAccessToken!,
            account.accountId,
            content.imageUrl,
            postCaption
          );
          results.push({
            accountId: account.id,
            platform: 'instagram',
            success: true,
            postUrl: postResult.postUrl,
          });

          await prisma.scheduledPost.create({
            data: {
              tenantId,
              contentId,
              socialAccountId: account.id,
              caption: postCaption,
              status: 'posted',
              postId: postResult.postId,
              postUrl: postResult.postUrl,
              postedAt: new Date(),
            },
          });
        }
      } catch (error: any) {
        logger.error('Failed to post to social account', { accountId: account.id, error: error.message });
        results.push({
          accountId: account.id,
          platform: account.platform,
          success: false,
          error: error.message,
        });
      }
    }

    // Update content status
    await prisma.content.update({
      where: { id: contentId },
      data: { status: 'posted' },
    });

    res.json({ results });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// SCHEDULE POST
// ============================================================================

const scheduleSchema = z.object({
  contentId: z.string().uuid(),
  accountIds: z.array(z.string().uuid()).min(1),
  caption: z.string().max(2200).optional(),
  scheduledFor: z.string().datetime(),
});

router.post('/schedule', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = scheduleSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError('Validation failed');
    }

    const { contentId, accountIds, caption, scheduledFor } = result.data;
    const tenantId = req.user!.tenantId;

    // Get the content
    const content = await prisma.content.findFirst({
      where: { id: contentId, tenantId },
    });

    if (!content) {
      throw new ValidationError('Content not found');
    }

    // Get the social accounts
    const accounts = await prisma.socialAccount.findMany({
      where: {
        id: { in: accountIds },
        tenantId,
        isActive: true,
      },
    });

    const scheduledPosts = [];

    for (const account of accounts) {
      const post = await prisma.scheduledPost.create({
        data: {
          tenantId,
          contentId,
          socialAccountId: account.id,
          caption: caption || content.caption,
          scheduledFor: new Date(scheduledFor),
          status: 'scheduled',
        },
      });
      scheduledPosts.push(post);
    }

    res.status(201).json({
      message: 'Posts scheduled successfully',
      scheduledPosts: scheduledPosts.map(p => ({
        id: p.id,
        scheduledFor: p.scheduledFor,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// GET SCHEDULED POSTS
// ============================================================================

router.get('/scheduled', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const posts = await prisma.scheduledPost.findMany({
      where: {
        tenantId: req.user!.tenantId,
        status: 'scheduled',
      },
      include: {
        socialAccount: {
          select: {
            platform: true,
            accountName: true,
            accountAvatar: true,
          },
        },
      },
      orderBy: { scheduledFor: 'asc' },
    });

    res.json({ posts });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// CANCEL SCHEDULED POST
// ============================================================================

router.delete('/scheduled/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.scheduledPost.deleteMany({
      where: {
        id: req.params.id,
        tenantId: req.user!.tenantId,
        status: 'scheduled',
      },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function postToFacebookPage(
  accessToken: string,
  pageId: string,
  imageUrl: string,
  caption: string
): Promise<{ postId: string; postUrl: string }> {
  // Upload photo to Facebook
  const response = await axios.post(
    `https://graph.facebook.com/v18.0/${pageId}/photos`,
    null,
    {
      params: {
        url: imageUrl,
        caption,
        access_token: accessToken,
      },
    }
  );

  const postId = response.data.post_id || response.data.id;
  const postUrl = `https://facebook.com/${postId}`;

  return { postId, postUrl };
}

async function postToInstagram(
  accessToken: string,
  igAccountId: string,
  imageUrl: string,
  caption: string
): Promise<{ postId: string; postUrl: string }> {
  // Step 1: Create media container
  const containerResponse = await axios.post(
    `https://graph.facebook.com/v18.0/${igAccountId}/media`,
    null,
    {
      params: {
        image_url: imageUrl,
        caption,
        access_token: accessToken,
      },
    }
  );

  const containerId = containerResponse.data.id;

  // Step 2: Wait a moment for processing
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Step 3: Publish the container
  const publishResponse = await axios.post(
    `https://graph.facebook.com/v18.0/${igAccountId}/media_publish`,
    null,
    {
      params: {
        creation_id: containerId,
        access_token: accessToken,
      },
    }
  );

  const postId = publishResponse.data.id;

  // Get permalink
  const mediaResponse = await axios.get(
    `https://graph.facebook.com/v18.0/${postId}`,
    {
      params: {
        fields: 'permalink',
        access_token: accessToken,
      },
    }
  );

  const postUrl = mediaResponse.data.permalink || `https://instagram.com/p/${postId}`;

  return { postId, postUrl };
}

export default router;
