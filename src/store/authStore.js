import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('cp_user') || 'null') : null,
  token: typeof window !== 'undefined' ? localStorage.getItem('cp_access_token') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('cp_access_token') : false,

  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cp_user', JSON.stringify(user));
      localStorage.setItem('cp_access_token', token);
    }
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cp_user');
      localStorage.removeItem('cp_access_token');
    }
    set({ user: null, token: null, isAuthenticated: false });
  }
}));
