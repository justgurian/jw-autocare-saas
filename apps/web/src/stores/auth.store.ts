import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, setAccessToken } from '../services/api';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  tenantId: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
    subscriptionTier: string;
    onboardingCompleted: boolean;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; businessName: string; firstName?: string; lastName?: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login({ email, password });
          const { user, tokens } = response.data;

          setAccessToken(tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: unknown) {
          const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(data);
          const { user, tokens } = response.data;

          setAccessToken(tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: unknown) {
          const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // Ignore errors on logout
        }

        setAccessToken(null);
        localStorage.removeItem('refreshToken');

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      checkAuth: async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          set({ isLoading: false, isAuthenticated: false });
          return;
        }

        setAccessToken(token);

        try {
          const response = await authApi.me();
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          setAccessToken(null);
          localStorage.removeItem('refreshToken');
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Initialize auth check on app load — non-blocking revalidation
// If persisted state already has a user, skip the loading spinner
if (typeof window !== 'undefined') {
  const persisted = JSON.parse(localStorage.getItem('auth-storage') || '{}');
  if (persisted?.state?.isAuthenticated && persisted?.state?.user) {
    // Trust persisted state, set isLoading false immediately, revalidate in background
    useAuthStore.setState({ isLoading: false });
  }
  useAuthStore.getState().checkAuth();
}

export default useAuthStore;
