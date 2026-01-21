// Common types shared between frontend and backend

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  tenantId: string;
}

export type UserRole = 'super_admin' | 'owner' | 'manager' | 'staff';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
}

export type SubscriptionTier = 'base' | 'premium';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'cancelled' | 'expired';

export interface BrandKit {
  id: string;
  tenantId: string;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  brandVoice: string | null;
  tagline: string | null;
  businessName: string | null;
  phone: string | null;
  address: string | null;
  defaultVehicle: 'corvette' | 'jeep';
}

export interface Content {
  id: string;
  tenantId: string;
  userId: string | null;
  tool: ContentTool;
  contentType: ContentType;
  title: string | null;
  theme: string | null;
  imageUrl: string | null;
  pdfUrl: string | null;
  thumbnailUrl: string | null;
  caption: string | null;
  captionSpanish: string | null;
  status: ContentStatus;
  moderationStatus: ModerationStatus;
  createdAt: string;
}

export type ContentTool =
  | 'promo_flyer'
  | 'instant_pack'
  | 'car_of_day'
  | 'check_in_to_win'
  | 'photo_tuner'
  | 'review_reply'
  | 'seo_blog'
  | 'personal_card'
  | 'jargon_buster'
  | 'sms_blast'
  | 'ugc_video';

export type ContentType = 'image' | 'video' | 'text' | 'pdf';
export type ContentStatus = 'draft' | 'approved' | 'posted' | 'archived';
export type ModerationStatus = 'pending' | 'passed' | 'flagged';

export interface CalendarEvent {
  id: string;
  tenantId: string;
  contentId: string | null;
  scheduledDate: string;
  beatType: BeatType | null;
  suggestedTopic: string | null;
  suggestedTheme: string | null;
  aiGenerated: boolean;
  status: CalendarEventStatus;
}

export type BeatType = 'promo' | 'educational' | 'engagement' | 'seasonal' | 'community';
export type CalendarEventStatus = 'suggested' | 'scheduled' | 'completed';

export interface Theme {
  id: string;
  name: string;
  category: string;
  previewUrl?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
