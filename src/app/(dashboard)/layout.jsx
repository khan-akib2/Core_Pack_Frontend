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


export default function DashboardLayout({ children }) {
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, isInitializing, setInitialized } = useAuthStore();
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
