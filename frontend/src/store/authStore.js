import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api, { requestPasswordResetOTP, confirmPasswordResetOTP } from '../api/api';

// Auth store using Zustand
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('api/auth/login/', credentials);
          const { user, token } = response.data;

          // Store token and user data
          localStorage.setItem('authToken', token);
          localStorage.setItem('user', JSON.stringify(user));

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          });

          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'Login failed';
          set({
            isLoading: false,
            error: errorMessage
          });
          return { success: false, error: errorMessage };
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('api/auth/register/', userData);
          const { user, token } = response.data;

          // Store token and user data
          localStorage.setItem('authToken', token);
          localStorage.setItem('user', JSON.stringify(user));

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          });

          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'Registration failed';
          set({
            isLoading: false,
            error: errorMessage
          });
          return { success: false, error: errorMessage };
        }
      },



      requestPasswordReset: async (email) => {
        set({ isLoading: true, error: null });
        try {
          await requestPasswordResetOTP(email);
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'Failed to send OTP';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      confirmPasswordReset: async (email, otp, newPassword) => {
        set({ isLoading: true, error: null });
        try {
          await confirmPasswordResetOTP(email, otp, newPassword);
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'Failed to reset password';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      logout: async () => {
        set({ isLoading: true });

        try {
          // Call logout API
          await api.post('api/auth/logout/');

          // Clear localStorage
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');

          // Clear all auth state
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });

          return { success: true };
        } catch (error) {
          console.error('Logout API error:', error);
          // Even if API call fails, clear local state
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Logout failed but local state cleared'
          });
        }
      },

      // Initialize auth state from localStorage
      initializeAuth: () => {
        const token = localStorage.getItem('authToken');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            set({
              user,
              token,
              isAuthenticated: true
            });
          } catch (error) {
            console.error('Failed to parse user data:', error);
            // Clear corrupted data
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
          }
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Update user data
      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          set({ user: updatedUser });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
