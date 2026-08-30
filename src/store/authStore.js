import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('cp_user') || 'null') : null,
  token: typeof window !== 'undefined' ? (localStorage.getItem('cp_access_token') || null) : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('cp_access_token') : false,
  isInitializing: false,

  setAuth: (user, token, refreshToken) => {
    if (typeof window !== 'undefined') {
      if (user) localStorage.setItem('cp_user', JSON.stringify(user));
      if (token) localStorage.setItem('cp_access_token', token);
      if (refreshToken) localStorage.setItem('cp_refresh_token', refreshToken);
    }
    set({ user, token, isAuthenticated: !!token, isInitializing: false });
  },

  setTokenOnly: (token) => {
    if (typeof window !== 'undefined' && token) {
      localStorage.setItem('cp_access_token', token);
    }
    set({ token, isAuthenticated: !!token });
  },

  setInitialized: (value) => {
    set({ isInitializing: value });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cp_user');
      localStorage.removeItem('cp_access_token');
      localStorage.removeItem('cp_refresh_token');
    }
    set({ user: null, token: null, isAuthenticated: false, isInitializing: false });
  }
}));
