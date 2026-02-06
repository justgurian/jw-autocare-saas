import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth.store';
import ErrorBoundary from './components/ErrorBoundary';

// Layout - loaded eagerly since they're needed immediately
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Lazy-loaded pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const AuthCallbackPage = lazy(() => import('./pages/auth/AuthCallbackPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const OnboardingPage = lazy(() => import('./pages/onboarding/OnboardingPage'));
const PromoFlyerPage = lazy(() => import('./pages/tools/promo-flyer/PromoFlyerPage'));
const BatchFlyerPage = lazy(() => import('./pages/tools/batch-flyer/BatchFlyerPage'));
const InstantPackPage = lazy(() => import('./pages/tools/instant-pack/InstantPackPage'));
const CampaignPage = lazy(() => import('./pages/tools/CampaignPage'));
const MemeGeneratorPage = lazy(() => import('./pages/tools/meme-generator/MemeGeneratorPage'));
const CheckInPage = lazy(() => import('./pages/tools/check-in/CheckInPage'));
const CarOfDayPage = lazy(() => import('./pages/tools/car-of-day/CarOfDayPage'));
const VideoCreatorPage = lazy(() => import('./pages/tools/video-creator/VideoCreatorPage'));
const ReviewReplyPage = lazy(() => import('./pages/tools/review-reply/ReviewReplyPage'));
const ThemeBrowserPage = lazy(() => import('./pages/tools/theme-browser/ThemeBrowserPage'));
const ImageEditorPage = lazy(() => import('./pages/tools/image-editor/ImageEditorPage'));
const JargonPage = lazy(() => import('./pages/tools/jargon/JargonPage'));
const SMSTemplatesPage = lazy(() => import('./pages/tools/sms-templates/SMSTemplatesPage'));
const BlogGeneratorPage = lazy(() => import('./pages/tools/blog-generator/BlogGeneratorPage'));
const BusinessCardsPage = lazy(() => import('./pages/tools/business-cards/BusinessCardsPage'));
const PhotoTunerPage = lazy(() => import('./pages/tools/photo-tuner/PhotoTunerPage'));
const CalendarPage = lazy(() => import('./pages/calendar/CalendarPage'));
const AnalyticsPage = lazy(() => import('./pages/analytics/AnalyticsPage'));
const ProfilePage = lazy(() => import('./pages/settings/ProfilePage'));
const SocialPage = lazy(() => import('./pages/settings/SocialPage'));
const AutoPilotPage = lazy(() => import('./pages/settings/AutoPilotPage'));

// Page loading spinner
function PageLoader() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin-slow w-12 h-12 border-4 border-retro-red border-t-transparent rounded-full mx-auto mb-3" />
        <p className="font-heading text-retro-navy text-sm">Loading...</p>
      </div>
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-retro-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin-slow w-16 h-16 border-4 border-retro-red border-t-transparent rounded-full mx-auto mb-4" />
          <p className="font-heading text-retro-navy">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
          </Route>

          {/* Onboarding */}
          <Route
            path="/onboarding/*"
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <OnboardingPage />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />

          {/* Main app routes */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
            <Route path="/tools/promo-flyer" element={<ErrorBoundary><PromoFlyerPage /></ErrorBoundary>} />
            <Route path="/tools/batch-flyer" element={<ErrorBoundary><BatchFlyerPage /></ErrorBoundary>} />
            <Route path="/tools/instant-pack" element={<ErrorBoundary><InstantPackPage /></ErrorBoundary>} />
            <Route path="/tools/meme-generator" element={<ErrorBoundary><MemeGeneratorPage /></ErrorBoundary>} />
            <Route path="/tools/check-in" element={<ErrorBoundary><CheckInPage /></ErrorBoundary>} />
            <Route path="/tools/car-of-day" element={<ErrorBoundary><CarOfDayPage /></ErrorBoundary>} />
            <Route path="/tools/video-creator" element={<ErrorBoundary><VideoCreatorPage /></ErrorBoundary>} />
            <Route path="/tools/review-reply" element={<ErrorBoundary><ReviewReplyPage /></ErrorBoundary>} />
            <Route path="/tools/theme-browser" element={<ErrorBoundary><ThemeBrowserPage /></ErrorBoundary>} />
            <Route path="/tools/image-editor" element={<ErrorBoundary><ImageEditorPage /></ErrorBoundary>} />
            <Route path="/tools/jargon" element={<ErrorBoundary><JargonPage /></ErrorBoundary>} />
            <Route path="/tools/sms-templates" element={<ErrorBoundary><SMSTemplatesPage /></ErrorBoundary>} />
            <Route path="/tools/blog-generator" element={<ErrorBoundary><BlogGeneratorPage /></ErrorBoundary>} />
            <Route path="/tools/business-cards" element={<ErrorBoundary><BusinessCardsPage /></ErrorBoundary>} />
            <Route path="/tools/photo-tuner" element={<ErrorBoundary><PhotoTunerPage /></ErrorBoundary>} />
            <Route path="/tools/campaigns" element={<ErrorBoundary><CampaignPage /></ErrorBoundary>} />
            <Route path="/calendar" element={<ErrorBoundary><CalendarPage /></ErrorBoundary>} />
            <Route path="/analytics" element={<ErrorBoundary><AnalyticsPage /></ErrorBoundary>} />
            <Route path="/settings/profile" element={<ErrorBoundary><ProfilePage /></ErrorBoundary>} />
            <Route path="/settings/social" element={<ErrorBoundary><SocialPage /></ErrorBoundary>} />
            <Route path="/settings/auto-pilot" element={<ErrorBoundary><AutoPilotPage /></ErrorBoundary>} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
