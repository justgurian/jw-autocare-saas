import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth.store';

// Layout
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AuthCallbackPage from './pages/auth/AuthCallbackPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import OnboardingPage from './pages/onboarding/OnboardingPage';
import PromoFlyerPage from './pages/tools/promo-flyer/PromoFlyerPage';
import InstantPackPage from './pages/tools/instant-pack/InstantPackPage';
import CampaignPage from './pages/tools/CampaignPage';
import MemeGeneratorPage from './pages/tools/meme-generator/MemeGeneratorPage';
import CheckInPage from './pages/tools/check-in/CheckInPage';
import CarOfDayPage from './pages/tools/car-of-day/CarOfDayPage';
import VideoCreatorPage from './pages/tools/video-creator/VideoCreatorPage';
import ReviewReplyPage from './pages/tools/review-reply/ReviewReplyPage';
import ThemeBrowserPage from './pages/tools/theme-browser/ThemeBrowserPage';
import ImageEditorPage from './pages/tools/image-editor/ImageEditorPage';
import JargonPage from './pages/tools/jargon/JargonPage';
import SMSTemplatesPage from './pages/tools/sms-templates/SMSTemplatesPage';
import BlogGeneratorPage from './pages/tools/blog-generator/BlogGeneratorPage';
import BusinessCardsPage from './pages/tools/business-cards/BusinessCardsPage';
import PhotoTunerPage from './pages/tools/photo-tuner/PhotoTunerPage';
import CalendarPage from './pages/calendar/CalendarPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import ProfilePage from './pages/settings/ProfilePage';
import SocialPage from './pages/settings/SocialPage';
import AutoPilotPage from './pages/settings/AutoPilotPage';

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
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
      </Route>

      {/* Onboarding */}
      <Route
        path="/onboarding/*"
        element={
          <ProtectedRoute>
            <OnboardingPage />
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
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tools/promo-flyer" element={<PromoFlyerPage />} />
        <Route path="/tools/instant-pack" element={<InstantPackPage />} />
        <Route path="/tools/meme-generator" element={<MemeGeneratorPage />} />
        <Route path="/tools/check-in" element={<CheckInPage />} />
        <Route path="/tools/car-of-day" element={<CarOfDayPage />} />
        <Route path="/tools/video-creator" element={<VideoCreatorPage />} />
        <Route path="/tools/review-reply" element={<ReviewReplyPage />} />
        <Route path="/tools/theme-browser" element={<ThemeBrowserPage />} />
        <Route path="/tools/image-editor" element={<ImageEditorPage />} />
        <Route path="/tools/jargon" element={<JargonPage />} />
        <Route path="/tools/sms-templates" element={<SMSTemplatesPage />} />
        <Route path="/tools/blog-generator" element={<BlogGeneratorPage />} />
        <Route path="/tools/business-cards" element={<BusinessCardsPage />} />
        <Route path="/tools/photo-tuner" element={<PhotoTunerPage />} />
        <Route path="/tools/campaigns" element={<CampaignPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings/profile" element={<ProfilePage />} />
        <Route path="/settings/social" element={<SocialPage />} />
        <Route path="/settings/auto-pilot" element={<AutoPilotPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
