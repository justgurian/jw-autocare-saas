import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
}

export function getAccessToken(): string | null {
  if (!accessToken) {
    accessToken = localStorage.getItem('accessToken');
  }
  return accessToken;
}

// Request interceptor
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const { accessToken: newToken, refreshToken: newRefreshToken } = response.data.tokens;

          setAccessToken(newToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch {
        // Refresh failed, logout
        setAccessToken(null);
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
      }
    }

    // Add user-friendly error messages based on status codes
    const err = error as AxiosError & { userMessage?: string };
    if (!error.response) {
      // Network error
      if (!navigator.onLine) {
        err.userMessage = "You're offline. Please check your internet connection.";
      } else {
        err.userMessage = 'Unable to reach the server. Please try again in a moment.';
      }
    } else {
      const status = error.response.status;
      if (status === 429) {
        err.userMessage = 'Too many requests. Please wait a moment before trying again.';
      } else if (status === 413) {
        err.userMessage = 'The file is too large. Please try a smaller image.';
      } else if (status >= 500) {
        err.userMessage = 'Our server is having trouble. Please try again in a moment.';
      } else if (status === 403) {
        err.userMessage = "You don't have permission to do that.";
      }
    }

    return Promise.reject(error);
  }
);

// Extract user-friendly error message from any error
export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'userMessage' in error) {
    return (error as { userMessage: string }).userMessage;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

// API methods
export const authApi = {
  register: (data: { email: string; password: string; businessName: string; firstName?: string; lastName?: string }) =>
    api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  logout: () =>
    api.post('/auth/logout'),

  me: () =>
    api.get('/auth/me'),

  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

export const onboardingApi = {
  getStatus: () => api.get('/onboarding/status'),
  getBrandKit: () => api.get('/onboarding/brand-kit'),
  updateBusinessInfo: (data: Record<string, unknown>) => api.post('/onboarding/step/1', data),
  uploadLogo: (logoUrl: string) => api.post('/onboarding/step/2/logo', { logoUrl }),
  updateColors: (colors: Record<string, string>) => api.post('/onboarding/step/2/colors', colors),
  addServices: (services: Array<Record<string, unknown>>) => api.post('/onboarding/step/3', { services }),
  updateBrandVoice: (brandVoice: string) => api.post('/onboarding/step/4', { brandVoice }),
  addSpecials: (specials: Array<Record<string, unknown>>) => api.post('/onboarding/step/5', { specials }),
  setDefaultVehicle: (vehicle: string) => api.post('/onboarding/step/6', { vehicle }),
  complete: () => api.post('/onboarding/complete'),
};

export const promoFlyerApi = {
  getThemes: () => api.get('/tools/promo-flyer/themes'),

  // Nostalgic themes with filtering
  getNostalgicThemes: (params?: { era?: string; style?: string }) =>
    api.get('/tools/promo-flyer/nostalgic-themes', { params }),

  // Get vehicles by era
  getVehicles: (era?: string) =>
    api.get('/tools/promo-flyer/vehicles', { params: era ? { era } : undefined }),

  // Random theme (Surprise Me!)
  getRandomTheme: (params?: { era?: string; style?: string; nostalgicOnly?: boolean }) =>
    api.get('/tools/promo-flyer/random-theme', { params }),

  // Push to Start - instant one-click generation
  instant: () => api.post('/tools/promo-flyer/instant'),

  // Generate single flyer (enhanced with vehicle and language options)
  generate: (data: {
    message: string;
    subject: string;
    details?: string;
    themeId: string;
    vehicleId?: string;
    language?: 'en' | 'es' | 'both';
    mascotId?: string;
  }) => api.post('/tools/promo-flyer/generate', data),

  // Generate pack of flyers
  generatePack: (data: {
    message: string;
    subject: string;
    details?: string;
    packType: 'variety-3' | 'variety-5' | 'week-7' | 'era' | 'style';
    era?: '1950s' | '1960s' | '1970s' | '1980s';
    style?: 'comic-book' | 'movie-poster' | 'magazine';
    vehicleId?: string;
    language?: 'en' | 'es' | 'both';
  }) => api.post('/tools/promo-flyer/generate-pack', data),

  generateMockup: (contentId: string, sceneIndex?: number) =>
    api.post('/tools/promo-flyer/mockup', { contentId, sceneIndex }),

  getPreview: (id: string) => api.get(`/tools/promo-flyer/preview/${id}`),

  // Style Families
  getFamilies: () => api.get('/tools/promo-flyer/families'),

  // Style Preferences
  getPreferences: () => api.get('/tools/promo-flyer/preferences'),
  savePreferences: (styleFamilyIds: string[]) =>
    api.post('/tools/promo-flyer/preferences', { styleFamilyIds }),

  // Feedback
  submitFeedback: (contentId: string, rating: 'fire' | 'solid' | 'meh') =>
    api.post('/tools/promo-flyer/feedback', { contentId, rating }),

  // Weekly Drop
  getWeeklyDrop: () => api.get('/tools/promo-flyer/weekly-drop'),
  dismissWeeklyDrop: () => api.post('/tools/promo-flyer/weekly-drop/dismiss'),

  // Calendar week plan (returns 7 theme selections without generating images)
  getWeekPlan: () => api.get('/tools/promo-flyer/calendar/week-plan'),

  // Instant generation with optional theme override
  instantThemed: (themeId: string) => api.post('/tools/promo-flyer/instant', { themeId }),

  // Car makes registry
  getCarMakes: () => api.get('/tools/promo-flyer/car-makes'),

  // Vehicle preferences
  getVehiclePreferences: () => api.get('/tools/promo-flyer/vehicle-preferences'),
  saveVehiclePreferences: (data: {
    lovedMakes: Array<{ makeId: string; models?: string[] }>;
    neverMakes: string[];
  }) => api.post('/tools/promo-flyer/vehicle-preferences', data),
};

export const memeApi = {
  getStyles: () => api.get('/tools/meme-generator/styles'),
  generate: (data: { styleId: string; topic: string; customText?: string; mascotId?: string }) =>
    api.post('/tools/meme-generator/generate', data),
  random: () => api.post('/tools/meme-generator/random'),
};

export const carOfDayApi = {
  // Get available asset types
  getAssetTypes: () => api.get('/tools/car-of-day/asset-types'),

  // Generate all assets (or specific types)
  generate: (data: {
    carImage: { base64: string; mimeType: string };
    personImage?: { base64: string; mimeType: string };
    carYear?: string;
    carMake?: string;
    carModel?: string;
    carColor?: string;
    carNickname?: string;
    ownerName?: string;
    ownerHandle?: string;
    assetTypes?: Array<'official' | 'comic' | 'action-figure' | 'movie-poster'>;
    logos?: Array<{ base64: string; mimeType: string }>;
    mascotId?: string;
  }) => api.post('/tools/car-of-day/generate', data),

  // Generate a single asset type
  generateSingle: (data: {
    assetType: 'official' | 'comic' | 'action-figure' | 'movie-poster';
    carImage: { base64: string; mimeType: string };
    personImage?: { base64: string; mimeType: string };
    carYear?: string;
    carMake?: string;
    carModel?: string;
    carColor?: string;
    carNickname?: string;
    ownerName?: string;
    ownerHandle?: string;
    logos?: Array<{ base64: string; mimeType: string }>;
  }) => api.post('/tools/car-of-day/generate-single', data),

  // Get generation history
  getHistory: (params?: { limit?: number }) =>
    api.get('/tools/car-of-day/history', { params }),

  // Delete an asset
  delete: (id: string) => api.delete(`/tools/car-of-day/${id}`),
};

export const videoCreatorApi = {
  // Get video templates
  getTemplates: () => api.get('/tools/video-creator/templates'),

  // Get template by ID
  getTemplate: (id: string) => api.get(`/tools/video-creator/templates/${id}`),

  // Get available options (styles, durations, aspect ratios)
  getOptions: () => api.get('/tools/video-creator/options'),

  // Start video generation
  generate: (data: {
    templateId?: string;
    customPrompt?: string;
    topic: string;
    serviceHighlight?: string;
    callToAction?: string;
    style: 'cinematic' | 'commercial' | 'social-media' | 'documentary' | 'animated' | 'retro';
    aspectRatio: '16:9' | '9:16';
    duration: '4s' | '6s' | '8s';
    resolution?: '720p' | '1080p';
    voiceoverText?: string;
    referenceImages?: Array<{ base64: string; mimeType: string; description?: string }>;
    mascotId?: string;
  }) => api.post('/tools/video-creator/generate', data),

  // Get job status
  getJob: (jobId: string) => api.get(`/tools/video-creator/jobs/${jobId}`),

  // Get video history
  getHistory: (params?: { limit?: number }) =>
    api.get('/tools/video-creator/history', { params }),

  // Delete a video
  delete: (id: string) => api.delete(`/tools/video-creator/${id}`),

  // Animate a flyer into a video
  generateFromFlyer: (flyerId: string, options?: {
    style?: 'cinematic' | 'commercial' | 'social-media' | 'documentary' | 'animated' | 'retro';
    aspectRatio?: '16:9' | '9:16';
    duration?: '4s' | '6s' | '8s';
    resolution?: '720p' | '1080p';
    animationPreset?: 'burnout' | 'money-rain' | 'cinematic-reveal' | 'neon-sign';
  }) => api.post(`/tools/video-creator/from-flyer/${flyerId}`, options || {}),

  // One-click instant commercial generation
  instant: () => api.post('/tools/video-creator/instant'),
};

export const reviewReplyApi = {
  // Generate a reply for a review
  generate: (data: {
    reviewText: string;
    reviewerName?: string;
    starRating?: number;
    platform?: 'google' | 'yelp' | 'facebook' | 'other';
    tone?: 'professional' | 'friendly' | 'apologetic' | 'grateful' | 'empathetic';
    includeOffer?: boolean;
    includeInviteBack?: boolean;
    mentionService?: string;
    customPoints?: string[];
  }) => api.post('/tools/review-reply/generate', data),

  // Analyze a review without generating response
  analyze: (data: { reviewText: string; starRating?: number }) =>
    api.post('/tools/review-reply/analyze', data),

  // Regenerate with different tone
  regenerate: (data: {
    reviewText: string;
    reviewerName?: string;
    starRating?: number;
    platform?: string;
    newTone: 'professional' | 'friendly' | 'apologetic' | 'grateful' | 'empathetic';
    includeOffer?: boolean;
    includeInviteBack?: boolean;
    mentionService?: string;
    customPoints?: string[];
  }) => api.post('/tools/review-reply/regenerate', data),

  // Get quick response templates
  getQuickResponses: () => api.get('/tools/review-reply/quick-responses'),

  // Get reply history
  getHistory: (params?: { limit?: number }) =>
    api.get('/tools/review-reply/history', { params }),

  // Delete a reply from history
  delete: (id: string) => api.delete(`/tools/review-reply/${id}`),
};

export const checkInApi = {
  // Get vehicle data for form dropdowns
  getVehicles: () => api.get('/tools/check-in/vehicles'),

  // Prize configuration
  getPrizes: () => api.get('/tools/check-in/prizes'),
  updatePrizes: (prizes: Array<{ id: string; label: string; probability: number; description?: string; expirationDays?: number }>) =>
    api.put('/tools/check-in/prizes', { prizes }),

  // Check-in flow
  submit: (data: {
    name: string;
    phone?: string;
    carYear: string;
    carMake: string;
    carModel: string;
    carColor: string;
    mileage?: string;
    issue: string;
  }) => api.post('/tools/check-in/submit', data),

  spin: (submissionId: string) =>
    api.post('/tools/check-in/spin', { submissionId }),

  generate: (data: {
    submissionId: string;
    personImage: { base64: string; mimeType: string };
    logos?: Array<{ base64: string; mimeType: string }>;
  }) => api.post('/tools/check-in/generate', data),

  // Prize redemption
  redeem: (validationCode: string) =>
    api.post('/tools/check-in/redeem', { validationCode }),

  validate: (code: string) =>
    api.get(`/tools/check-in/validate/${code}`),

  // Submissions
  getSubmissions: (params?: { limit?: number; includeRedeemed?: boolean }) =>
    api.get('/tools/check-in/submissions', { params }),

  getSubmission: (id: string) =>
    api.get(`/tools/check-in/submissions/${id}`),
};

export const instantPackApi = {
  generate: (data: { count: number; language?: string }) =>
    api.post('/tools/instant-pack/generate', data),
  getJob: (jobId: string) => api.get(`/tools/instant-pack/jobs/${jobId}`),
  getProgress: (jobId: string) => api.get(`/tools/instant-pack/jobs/${jobId}/progress`),
};

export const calendarApi = {
  getEvents: (params?: { month?: number; year?: number }) =>
    api.get('/calendar', { params }),
  generate: (data: { month: number; year: number; count?: number }) =>
    api.post('/calendar/generate', data),
  updateEvent: (id: string, data: Record<string, unknown>) =>
    api.put(`/calendar/events/${id}`, data),
  deleteEvent: (id: string) => api.delete(`/calendar/events/${id}`),
  exportCalendar: (format: 'pdf' | 'ical', params?: { month?: number; year?: number }) =>
    api.get(`/calendar/export/${format}`, { params }),
};

export const contentApi = {
  getAll: (params?: { tool?: string; status?: string; page?: number; limit?: number }) =>
    api.get('/content', { params }),
  getOne: (id: string) => api.get(`/content/${id}`),
  update: (id: string, data: Record<string, unknown>) => api.put(`/content/${id}`, data),
  delete: (id: string) => api.delete(`/content/${id}`),
  approve: (id: string) => api.post(`/content/${id}/approve`),
  download: (id: string, format: 'png' | 'pdf') => api.get(`/content/${id}/download/${format}`),
  edit: (id: string, data: {
    editType: 'swap-vehicle' | 'change-text' | 'adjust-preset' | 'custom';
    vehicleMake?: string;
    vehicleModel?: string;
    newHeadline?: string;
    preset?: 'brighten' | 'darken' | 'more-contrast' | 'less-contrast' | 'warmer' | 'cooler' | 'vintage' | 'sharpen';
    customPrompt?: string;
  }) => api.post(`/content/${id}/edit`, data),
  getEditSuggestions: (id: string) => api.get(`/content/${id}/edit-suggestions`),
};

export const analyticsApi = {
  getOverview: () => api.get('/analytics/overview'),
  getUsage: (period?: number) => api.get('/analytics/usage', { params: { period } }),
  getContentStats: () => api.get('/analytics/content-stats'),
  getTimeSaved: () => api.get('/analytics/time-saved'),
  exportReport: (format: 'csv' | 'pdf') => api.get(`/analytics/export/${format}`),
};

export const billingApi = {
  getSubscription: () => api.get('/billing/subscription'),
  getUsage: () => api.get('/billing/usage'),
};

/**
 * Stream an NDJSON POST request using native fetch + ReadableStream.
 * Axios doesn't support streaming, so we bypass it here.
 * Each line of the response is parsed as JSON and passed to onEvent().
 */
export async function streamNdjsonPost<T = any>(
  path: string,
  body: Record<string, unknown>,
  onEvent: (event: T) => void,
): Promise<void> {
  const token = getAccessToken();
  const baseUrl = import.meta.env.VITE_API_URL || '/api/v1';
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}`);
  }

  const contentType = resp.headers.get('content-type') || '';

  // If server returned regular JSON (pastedText mode), handle as single event
  if (contentType.includes('application/json')) {
    const data = await resp.json();
    onEvent({ type: 'result', success: true, extracted: data.extracted || data, source: 'text' } as T);
    return;
  }

  // NDJSON streaming
  const reader = resp.body?.getReader();
  if (!reader) throw new Error('Response body is not readable');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    // Keep the last (possibly incomplete) line in the buffer
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        onEvent(JSON.parse(trimmed) as T);
      } catch {
        // Skip malformed lines
      }
    }
  }

  // Process any remaining data in the buffer
  if (buffer.trim()) {
    try {
      onEvent(JSON.parse(buffer.trim()) as T);
    } catch {
      // Skip
    }
  }
}

export const brandKitApi = {
  get: () => api.get('/brand-kit'),
  update: (data: Record<string, unknown>) => api.put('/brand-kit', data),
  getProfile: () => api.get('/brand-kit/profile'),
  updateProfile: (data: Record<string, unknown>) => api.put('/brand-kit/profile', data),
  getCompletion: () => api.get('/brand-kit/completion'),
  addSpecialty: (specialty: string) => api.post('/brand-kit/specialties', { specialty }),
  removeSpecialty: (specialty: string) => api.delete('/brand-kit/specialties', { data: { specialty } }),
  addUSP: (usp: string) => api.post('/brand-kit/usps', { usp }),
  removeUSP: (usp: string) => api.delete('/brand-kit/usps', { data: { usp } }),
  importWebsite: (data: { url?: string; pastedText?: string }) =>
    api.post('/brand-kit/import-website', data),
  importConfirm: (data: any) =>
    api.post('/brand-kit/import-confirm', data),
};

export const campaignApi = {
  getTemplates: () => api.get('/campaigns/templates'),
  launch: (data: {
    templateId: string;
    topic: string;
    details?: string;
    startDate?: string;
    language?: string;
  }) => api.post('/campaigns/launch', data),
  getJob: (jobId: string) => api.get(`/campaigns/jobs/${jobId}`),
  getRecent: () => api.get('/campaigns/recent'),
};

export const socialApi = {
  getAccounts: () => api.get('/social/accounts'),
  getAuthUrl: (platform: 'facebook') => api.get(`/social/${platform}/auth-url`),
  disconnectAccount: (id: string) => api.delete(`/social/accounts/${id}`),
  postNow: (data: { contentId: string; accountIds: string[]; caption?: string }) =>
    api.post('/social/post', data),
  schedulePost: (data: { contentId: string; accountIds: string[]; caption?: string; scheduledFor: string }) =>
    api.post('/social/schedule', data),
  getScheduledPosts: () => api.get('/social/scheduled'),
  cancelScheduledPost: (id: string) => api.delete(`/social/scheduled/${id}`),
};

export const batchFlyerApi = {
  // Smart AI suggestions
  getSuggestions: () => api.get('/batch-flyer/suggestions'),
  getTopThemes: () => api.get('/batch-flyer/top-themes'),

  // Batch generation
  generate: (data: {
    mode: 'quick' | 'week' | 'month';
    count: number;
    contentType: 'services' | 'specials' | 'custom' | 'mixed';
    serviceIds?: string[];
    specialIds?: string[];
    customContent?: Array<{ message: string; subject: string; details?: string }>;
    themeStrategy: 'auto' | 'single' | 'matrix' | 'family-sampler';
    singleThemeId?: string;
    themeMatrix?: Array<{ index: number; themeId: string }>;
    language: 'en' | 'es' | 'both';
    vehicleId?: string;
    mascotId?: string;
  }) => api.post('/batch-flyer/generate', data),

  // Job status
  getJob: (jobId: string) => api.get(`/batch-flyer/jobs/${jobId}`),
  getJobFlyers: (jobId: string) => api.get(`/batch-flyer/jobs/${jobId}/flyers`),

  // Flyer actions
  approveFlyer: (id: string, data?: { scheduledFor?: string; caption?: string }) =>
    api.post(`/batch-flyer/flyers/${id}/approve`, data || {}),
  rejectFlyer: (id: string) =>
    api.post(`/batch-flyer/flyers/${id}/reject`),
  updateCaption: (id: string, data: { caption: string; captionSpanish?: string }) =>
    api.put(`/batch-flyer/flyers/${id}/caption`, data),
  inpaint: (id: string, data: {
    editType: 'preset' | 'custom';
    preset?: 'brighten' | 'darken' | 'more-contrast' | 'less-contrast' | 'warmer' | 'cooler' | 'vintage' | 'sharpen';
    customPrompt?: string;
  }) => api.post(`/batch-flyer/flyers/${id}/inpaint`, data),

  // Favorites
  getFavorites: () => api.get('/batch-flyer/favorites'),
  saveFavorite: (data: {
    name: string;
    themeId: string;
    serviceId?: string;
    specialId?: string;
    customText?: string;
    contentId?: string;
  }) => api.post('/batch-flyer/favorites', data),
  deleteFavorite: (id: string) => api.delete(`/batch-flyer/favorites/${id}`),
};

export const downloadApi = {
  downloadSingle: (contentId: string) =>
    api.get(`/download/${contentId}`, { responseType: 'blob' }),
  downloadBulk: (contentIds: string[], includeCaption = true) =>
    api.post('/download/bulk', { contentIds, includeCaption }, { responseType: 'blob' }),
  downloadCampaign: (jobId: string) =>
    api.get(`/download/campaign/${jobId}`, { responseType: 'blob' }),
  downloadAll: () =>
    api.get('/download/all', { responseType: 'blob' }),
};

export const ugcCreatorApi = {
  getCharacters: () => api.get('/tools/ugc-creator/characters'),
  getScenes: (category?: string) => api.get('/tools/ugc-creator/scenes', { params: { category } }),
  generate: (data: {
    sceneId: string;
    characterId: string;
    car?: { year: string; make: string; model: string; color: string };
    aspectRatio: '16:9' | '9:16';
    duration: '4s' | '6s' | '8s';
    commercialScript?: string;
  }) => api.post('/tools/ugc-creator/generate', data),
  getJob: (jobId: string) => api.get(`/tools/ugc-creator/jobs/${jobId}`),
  getHistory: (params?: { limit?: number }) => api.get('/tools/ugc-creator/history', { params }),
  delete: (id: string) => api.delete(`/tools/ugc-creator/${id}`),
};

export const directorsCutApi = {
  getEffects: () => api.get('/tools/directors-cut/effects'),
  animate: (flyerId: string, data: { effectId: string; aspectRatio?: string; duration?: string }) =>
    api.post(`/tools/directors-cut/animate/${flyerId}`, data),
  getJob: (jobId: string) => api.get(`/tools/directors-cut/jobs/${jobId}`),
  getHistory: (params?: { limit?: number }) => api.get('/tools/directors-cut/history', { params }),
};

export const celebrationApi = {
  getTemplates: () => api.get('/tools/celebration/templates'),
  getScenarios: () => api.get('/tools/celebration/scenarios'),
  generate: (data: {
    scenarioId?: string;
    celebrationType?: string;
    personName: string;
    personTags?: string[];
    occasion?: string;
    customMessage?: string;
    inputSource?: 'photo' | 'mascot' | 'generic';
    photoBase64?: string;
    photoMimeType?: string;
    mascotId?: string;
    aspectRatio?: string;
    duration?: string;
  }) => api.post('/tools/celebration/generate', data),
  getJob: (jobId: string) => api.get(`/tools/celebration/jobs/${jobId}`),
};

export const mascotBuilderApi = {
  getOptions: () => api.get('/tools/mascot-builder/options'),
  generate: (data: {
    shirtName: string;
    mascotName?: string;
    mascotStyle?: string;
    furColor: string;
    eyeStyle: string;
    hairstyle: string;
    outfitColor: string;
    outfitType?: string;
    accessory?: string;
    seasonalAccessory?: string;
    personality?: {
      presetId: string;
      catchphrase: string;
      energyLevel: string;
      speakingStyle: string;
    };
  }) => api.post('/tools/mascot-builder/generate', data),
  getMascots: () => api.get('/tools/mascot-builder/mascots'),
  deleteMascot: (id: string) => api.delete(`/tools/mascot-builder/mascots/${id}`),
};

export const styleClonerApi = {
  // Admin endpoints
  analyze: (data: { imageBase64: string; mimeType: string }) =>
    api.post('/tools/style-cloner/analyze', data),
  save: (data: {
    name: string;
    shortDescription?: string;
    sourceIndustry?: string;
    imagePrompt: { style: string; colorPalette: string; typography: string; elements: string; mood: string };
    compositionNotes?: string;
    avoidList?: string;
    previewColors?: string[];
    textPrompt?: { tone: string; vocabulary: string[] };
    referenceImageBase64: string;
    referenceMimeType: string;
  }) => api.post('/tools/style-cloner/save', data),
  preview: (id: string) =>
    api.post(`/tools/style-cloner/preview/${id}`),
  deploy: (id: string) =>
    api.put(`/tools/style-cloner/deploy/${id}`),
  getThemes: () =>
    api.get('/tools/style-cloner/themes'),
  getTheme: (id: string) =>
    api.get(`/tools/style-cloner/themes/${id}`),
  updateTheme: (id: string, data: Record<string, unknown>) =>
    api.put(`/tools/style-cloner/themes/${id}`, data),
  deleteTheme: (id: string) =>
    api.delete(`/tools/style-cloner/themes/${id}`),

  // User endpoints
  getNewStyles: () =>
    api.get('/tools/style-cloner/new-styles'),
  approve: (id: string) =>
    api.post(`/tools/style-cloner/approve/${id}`),
  reject: (id: string) =>
    api.post(`/tools/style-cloner/reject/${id}`),
};

export const shopPhotographerApi = {
  getScenes: (category?: string) => api.get('/tools/shop-photographer/scenes', { params: { category } }),
  getAesthetics: () => api.get('/tools/shop-photographer/aesthetics'),
  getGallery: () => api.get('/tools/shop-photographer/gallery'),
  addToGallery: (data: { imageBase64: string; mimeType: string }) =>
    api.post('/tools/shop-photographer/gallery', data),
  removeFromGallery: (index: number) => api.delete(`/tools/shop-photographer/gallery/${index}`),
  analyzeGallery: () => api.post('/tools/shop-photographer/gallery/analyze'),
  enhance: (data: {
    photoBase64: string;
    photoMimeType: string;
    outputMode: 'photo-only' | 'photo-logo' | 'photo-text' | 'video';
    enhancementStyle: 'dramatic' | 'clean' | 'moody' | 'bright' | 'auto';
    textContent?: { headline?: string; subheadline?: string; cta?: string };
    aspectRatio?: string;
  }) => api.post('/tools/shop-photographer/enhance', data),
  generate: (data: {
    sceneId: string;
    outputMode: 'photo-only' | 'photo-logo' | 'photo-text' | 'video';
    aestheticId?: string;
    textContent?: { headline?: string; subheadline?: string; cta?: string };
    aspectRatio?: string;
  }) => api.post('/tools/shop-photographer/generate', data),
  generateVideo: (data: {
    sceneId: string;
    aestheticId?: string;
    aspectRatio?: string;
    duration?: number;
  }) => api.post('/tools/shop-photographer/generate-video', data),
  getJob: (jobId: string) => api.get(`/tools/shop-photographer/jobs/${jobId}`),
  getHistory: (params?: { limit?: number; offset?: number }) =>
    api.get('/tools/shop-photographer/history', { params }),
  delete: (id: string) => api.delete(`/tools/shop-photographer/${id}`),
};

export const jingleGeneratorApi = {
  getGenres: () => api.get('/tools/jingle-generator/genres'),
  preview: (shopName: string) =>
    api.post('/tools/jingle-generator/preview', { shopName }),
  generate: (data: {
    shopName: string;
    genreId: string;
    mode?: 'easy' | 'custom';
    customGenre?: string;
    customLyrics?: string;
  }) => api.post('/tools/jingle-generator/generate', data),
  getJob: (jobId: string) => api.get(`/tools/jingle-generator/jobs/${jobId}`),
  getHistory: (params?: { limit?: number; offset?: number }) =>
    api.get('/tools/jingle-generator/history', { params }),
  delete: (id: string) => api.delete(`/tools/jingle-generator/${id}`),
};

export const hiringFlyerApi = {
  getPositions: () => api.get('/tools/hiring-flyer/positions'),
  generate: (data: {
    mode: 'simple' | 'detailed';
    jobTitle: string;
    jobType: 'full-time' | 'part-time' | 'seasonal';
    payRange?: string;
    howToApply: 'call' | 'email' | 'visit' | 'online';
    requiredCerts?: string[];
    skills?: string[];
    benefits?: string[];
    experienceLevel?: 'none' | 'entry' | 'mid' | 'senior';
    urgency?: 'normal' | 'urgent' | 'immediate';
    themeId?: string;
    language?: 'en' | 'es' | 'both';
  }) => api.post('/tools/hiring-flyer/generate', data),
  instant: () => api.post('/tools/hiring-flyer/instant', {}),
  getHistory: (params?: { limit?: number }) =>
    api.get('/tools/hiring-flyer/history', { params }),
  delete: (id: string) => api.delete(`/tools/hiring-flyer/${id}`),
};

export const servicesApi = {
  getAll: () => api.get('/services'),
  create: (data: any) => api.post('/services', data),
  update: (id: string, data: any) => api.put(`/services/${id}`, data),
  delete: (id: string) => api.delete(`/services/${id}`),
};

export const specialsApi = {
  getAll: () => api.get('/specials'),
  create: (data: any) => api.post('/specials', data),
  update: (id: string, data: any) => api.put(`/specials/${id}`, data),
  delete: (id: string) => api.delete(`/specials/${id}`),
};

// Named export for convenience
export { api };

export default api;
