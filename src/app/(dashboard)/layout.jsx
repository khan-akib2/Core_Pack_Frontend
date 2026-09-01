'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import GlobalSearchModal from '@/components/layout/GlobalSearchModal';
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { Lock } from 'lucide-react';


export default function DashboardLayout({ children }) {
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const { isAuthenticated, isInitializing, setInitialized, isUnlocked, setUnlocked, setAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hydration Effect: attempts silent refresh if we suspect the user is logged in but tokens are missing from memory
  useEffect(() => {
    const hydrate = async () => {
      if (!isInitializing) return;
      try {
        // This triggers the api.js 401 interceptor, which silently hits /auth/refresh and injects the token
        const res = await api.get('/auth/me');
        useAuthStore.setState({ user: res.data.data }); // update local user profile
      } catch (error) {
        // Refresh failed (e.g. revoked or expired 30d session)
        // api.js interceptor will have already cleared the state and kicked to /login
      } finally {
        setInitialized(false);
      }
    };
    hydrate();
  }, [isInitializing, setInitialized]);

  // Global Ctrl+K / Cmd+K search shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (mounted && !isInitializing && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isInitializing, isAuthenticated, router]);

  const triggerBiometric = async () => {
    if (!Capacitor.isNativePlatform()) {
      setUnlocked(true);
      return;
    }
    if (isUnlocking) return;
    setIsUnlocking(true);
    setUnlockError('');
    try {
      let refreshToken = null;
      try {
        const res = await SecureStorage.get({ key: 'cp_refresh_token' });
        refreshToken = res.value;
      } catch (e) {
        // If SecureStorage throws (key not found), check localStorage for old tokens
        refreshToken = localStorage.getItem('cp_refresh_token');
        if (refreshToken) {
          await SecureStorage.set({ key: 'cp_refresh_token', value: refreshToken }).catch(() => {});
          localStorage.removeItem('cp_refresh_token');
        }
      }

      if (!refreshToken) {
        setUnlockError('No refresh token found. Please log out and log in again.');
        setIsUnlocking(false);
        return;
      }
      const result = await NativeBiometric.isAvailable();
      if (!result.isAvailable) {
        setUnlockError('Biometric hardware not available on this device.');
        setIsUnlocking(false);
        return;
      }
      await NativeBiometric.verifyIdentity({
        reason: "Authenticate to unlock CorePack",
        title: "Biometric Unlock"
      });
      
      const response = await api.post('/auth/refresh-token', { refreshToken });
      const { user, accessToken, refreshToken: newRefreshToken } = response.data.data;
      setAuth(user, accessToken, newRefreshToken);
      setUnlocked(true);
    } catch (err) {
      console.error('Biometric failed:', err);
      if (err.response) {
        setUnlockError(`Network/Auth Error: ${err.response.status} - ${err.response.data?.message || 'Failed'}`);
      } else {
        setUnlockError(`Biometric Error: ${err.message || 'Verification failed or canceled'}`);
      }
      // If refresh token is expired or revoked (401 or 400), force logout so they aren't stuck forever
      if (err.response?.status === 401 || err.response?.status === 400 || err.response?.status === 404) {
         useAuthStore.getState().logout();
         window.location.href = '/login';
      }
    } finally {
      setIsUnlocking(false);
    }
  };

  useEffect(() => {
    if (mounted && isAuthenticated && !isUnlocked) {
      triggerBiometric();
    }
  }, [mounted, isAuthenticated, isUnlocked]);

  // Register for Push Notifications on Native Platform
  useEffect(() => {
    if (mounted && isAuthenticated && Capacitor.isNativePlatform()) {
      const registerPush = async () => {
        try {
          let permStatus = await PushNotifications.checkPermissions();
          if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
          }
          if (permStatus.receive !== 'granted') {
            return;
          }
          await PushNotifications.register();
          
          // Remove old listeners to prevent duplicates in strict mode
          await PushNotifications.removeAllListeners();
          
          PushNotifications.addListener('registration', async (token) => {
            console.log('Push registration success, token:', token.value);
            try {
              await api.put('/auth/session/push-token', { pushToken: token.value });
            } catch (err) {
              console.error('Failed to sync push token:', err);
            }
          });
          
          PushNotifications.addListener('registrationError', (error) => {
            console.error('Error on push registration:', error);
          });
        } catch (e) {
          console.error('Push setup failed:', e);
        }
      };
      
      registerPush();
    }
  }, [mounted, isAuthenticated]);


  if (!mounted || isInitializing) {
    return (
      <div className="min-h-screen bg-[#0B132A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#0B132A] flex flex-col items-center justify-center p-4 antialiased">
        <div className="w-16 h-16 mb-4 text-orange-500 opacity-80 flex items-center justify-center bg-orange-500/10 rounded-full">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl text-white font-semibold tracking-tight">App Locked</h2>
        <p className="text-slate-400 mt-2 text-sm text-center max-w-xs">Please verify your identity to continue.</p>
        
        {unlockError && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg max-w-xs text-center">
            <p className="text-red-400 text-xs">{unlockError}</p>
          </div>
        )}

        <button 
          onClick={triggerBiometric} 
          disabled={isUnlocking}
          className="mt-8 px-6 py-2.5 bg-gradient-to-r from-[#E85C0D] to-[#F97316] hover:from-[#D4530A] hover:to-[#EA580C] text-white font-medium rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isUnlocking ? 'Verifying...' : 'Unlock CorePack'}
        </button>
        
        {unlockError && (
          <button 
            onClick={() => {
              useAuthStore.getState().logout();
              window.location.href = '/login';
            }} 
            className="mt-4 text-xs text-slate-500 hover:text-slate-300 underline"
          >
            Force Logout
          </button>
        )}
      </div>
    );
  }

  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-[#0B132A] flex print:block font-sans antialiased text-slate-800 selection:bg-orange-500 selection:text-white">
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />
        <div className="flex-1 bg-[#F4F6FB] shadow-2xl flex flex-col min-w-0 h-screen overflow-hidden print:h-auto print:overflow-visible">
          <div className="print:hidden">
            <Header
              onOpenSearch={() => setIsSearchOpen(true)}
              onMenuToggle={() => setIsMobileMenuOpen(true)}
            />
          </div>
          <main className="p-4 sm:p-8 print:p-0 flex-1 overflow-y-auto print:overflow-visible bg-[#F4F6FB] print:bg-white">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
        <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      </div>
    </SmoothScrollProvider>
  );
}
