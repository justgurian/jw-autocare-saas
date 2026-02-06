/**
 * Shared content types used across the application.
 */

/** Generated content from any tool (flyer, meme, etc.) */
export interface GeneratedContent {
  id: string;
  imageUrl: string;
  caption: string;
  captionSpanish?: string | null;
  title?: string;
  theme: string;
  themeName: string;
  vehicle?: { id: string; name: string };
}

/** Social media account connection */
export interface SocialAccount {
  id: string;
  platform: 'facebook' | 'instagram';
  accountName: string;
  accountUsername?: string;
  accountAvatar?: string;
}
