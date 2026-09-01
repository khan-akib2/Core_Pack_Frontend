import { create } from 'zustand';
import { Capacitor } from '@capacitor/core';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';


export const useAuthStore = create((set) => ({
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('cp_user') || 'null') : null,
  token: typeof window !== 'undefined' ? (localStorage.getItem('cp_access_token') || null) : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('cp_access_token') : false,
  isInitializing: false,
  isUnlocked: typeof window !== 'undefined' ? !(Capacitor.isNativePlatform() && localStorage.getItem('cp_biometric_enabled') === 'true') : true,

  setAuth: (user, token, refreshToken) => {
    if (typeof window !== 'undefined') {
      if (user) localStorage.setItem('cp_user', JSON.stringify(user));
      if (token) localStorage.setItem('cp_access_token', token);
      if (refreshToken) {
        if (Capacitor.isNativePlatform()) {
          // Fire and forget, or handle async properly if needed
          SecureStorage.set({ key: 'cp_refresh_token', value: refreshToken }).catch(console.error);
        } else {
          localStorage.setItem('cp_refresh_token', refreshToken);
        }
      }
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

  setUnlocked: (value) => {
    set({ isUnlocked: value });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cp_user');
      localStorage.removeItem('cp_access_token');
      if (Capacitor.isNativePlatform()) {
        SecureStorage.remove({ key: 'cp_refresh_token' }).catch(console.error);
        localStorage.removeItem('cp_biometric_enabled');
      } else {
        localStorage.removeItem('cp_refresh_token');
      }
    }
    set({ user: null, token: null, isAuthenticated: false, isInitializing: false, isUnlocked: false });
  }
}));
