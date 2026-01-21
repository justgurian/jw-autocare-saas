import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setAccessToken } from '../../services/api';
import { useAuthStore } from '../../stores/auth.store';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    if (error) {
      navigate('/auth/login?error=' + error);
      return;
    }

    if (accessToken && refreshToken) {
      setAccessToken(accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      checkAuth().then(() => {
        navigate('/dashboard');
      });
    } else {
      navigate('/auth/login');
    }
  }, [searchParams, navigate, checkAuth]);

  return (
    <div className="text-center">
      <div className="animate-spin-slow w-16 h-16 border-4 border-retro-red border-t-transparent rounded-full mx-auto mb-4" />
      <p className="font-heading text-retro-navy">Completing sign in...</p>
    </div>
  );
}
