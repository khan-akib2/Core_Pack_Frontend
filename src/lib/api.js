import axios from 'axios';
import { Capacitor } from '@capacitor/core';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { useAuthStore } from '../store/authStore';

let API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://core-pack-backend.onrender.com/api/v1';

// Development only: route localhost to Android emulator alias if needed
if (Capacitor.isNativePlatform() && API_BASE_URL.includes('localhost')) {
  API_BASE_URL = API_BASE_URL.replace('localhost', '10.0.2.2');
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Single-flight refresh state
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  // Use in-memory token from Zustand store
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (typeof window !== 'undefined') {
    // Fallback: cleanup old insecure tokens if they exist during migration
    const oldToken = localStorage.getItem('cp_access_token');
    if (oldToken) {
      config.headers.Authorization = `Bearer ${oldToken}`;
      // Let it pass for now, we'll migrate them silently or force them to re-login if it expires
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't retried yet, and it's not the refresh endpoint itself
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/refresh-token')) {
      if (isRefreshing) {
        // If already refreshing, queue the request
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh
        let storedRefreshToken = null;
        if (typeof window !== 'undefined') {
          if (Capacitor.isNativePlatform()) {
            try {
              const res = await SecureStorage.get({ key: 'cp_refresh_token' });
              storedRefreshToken = res.value;
            } catch (e) {
              storedRefreshToken = localStorage.getItem('cp_refresh_token');
            }
          } else {
            storedRefreshToken = localStorage.getItem('cp_refresh_token');
          }
        }
        
        const { data } = await api.post('/auth/refresh-token', {}, { 
          withCredentials: true,
          headers: storedRefreshToken ? { 'x-refresh-token': storedRefreshToken } : {}
        });
        const newToken = data.data.accessToken;
        
        if (data.data.refreshToken && typeof window !== 'undefined') {
          if (Capacitor.isNativePlatform()) {
            await SecureStorage.set({ key: 'cp_refresh_token', value: data.data.refreshToken }).catch(console.error);
          } else {
            localStorage.setItem('cp_refresh_token', data.data.refreshToken);
          }
        }

        // Save new token to memory
        useAuthStore.getState().setTokenOnly(newToken);

        // Process queued requests
        processQueue(null, newToken);
        
        // Retry original request
        originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
        return api(originalRequest);
        
      } catch (refreshError) {
        // Refresh failed (token expired, revoked, reuse detected, etc.)
        processQueue(refreshError, null);
        
        // Clear state and force logout
        useAuthStore.getState().logout();
        
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
