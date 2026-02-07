import { z } from 'zod';

// ─── Genre Type ──────────────────────────────────────────────────────────────

export interface JingleGenre {
  id: string;
  name: string;
  icon: string;
  description: string;
  positiveGlobalStyles: string[];
  negativeGlobalStyles: string[];
  chorusLocalStyles: string[];
  introOutroLocalStyles: string[];
}

// ─── Composition Plan Types (mirrors ElevenLabs API) ─────────────────────────

export interface SongSection {
  section_name: string;
  positive_local_styles: string[];
  negative_local_styles: string[];
  duration_ms: number;
  lines: string[];
}

export interface CompositionPlan {
  positive_global_styles: string[];
  negative_global_styles: string[];
  sections: SongSection[];
}

// ─── Request/Response Types ──────────────────────────────────────────────────

export interface JingleGenerationInput {
  shopName: string;
  genreId: string;
}

export interface JingleJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  audioUrl?: string;
  contentId?: string;
  error?: string;
  createdAt: Date;
}

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

export const generateJingleSchema = z.object({
  shopName: z.string().min(1, 'Shop name is required').max(100, 'Shop name too long'),
  genreId: z.string().min(1, 'Genre is required'),
});
