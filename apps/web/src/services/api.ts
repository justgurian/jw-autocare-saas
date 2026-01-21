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

    return Promise.reject(error);
  }
);

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
  // Push to Start - instant one-click generation
  instant: () => api.post('/tools/promo-flyer/instant'),
  generate: (data: { message: string; subject: string; details?: string; themeId: string; language?: string }) =>
    api.post('/tools/promo-flyer/generate', data),
  generateMockup: (contentId: string, sceneIndex?: number) =>
    api.post('/tools/promo-flyer/mockup', { contentId, sceneIndex }),
  getPreview: (id: string) => api.get(`/tools/promo-flyer/preview/${id}`),
};

export const memeApi = {
  getStyles: () => api.get('/tools/meme-generator/styles'),
  generate: (data: { styleId: string; topic: string; customText?: string }) =>
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
    aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
    duration: '5s' | '10s' | '15s' | '30s';
    includeLogoOverlay?: boolean;
    includeMusicTrack?: boolean;
    voiceoverText?: string;
    referenceImages?: Array<{ base64: string; mimeType: string; description?: string }>;
  }) => api.post('/tools/video-creator/generate', data),

  // Get job status
  getJob: (jobId: string) => api.get(`/tools/video-creator/jobs/${jobId}`),

  // Get video history
  getHistory: (params?: { limit?: number }) =>
    api.get('/tools/video-creator/history', { params }),

  // Delete a video
  delete: (id: string) => api.delete(`/tools/video-creator/${id}`),
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
  createSubscription: (tier: string) => api.post('/billing/subscription', { tier }),
  updateSubscription: (tier: string) => api.put('/billing/subscription', { tier }),
  getUsage: () => api.get('/billing/usage'),
  getInvoices: () => api.get('/billing/invoices'),
};

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

// Named export for convenience
export { api };

export default api;
