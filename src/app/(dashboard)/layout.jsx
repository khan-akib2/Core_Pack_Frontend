'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import GlobalSearchModal from '@/components/layout/GlobalSearchModal';
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider';
import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout({ children }) {
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

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
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted) {
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
          <Header
            onOpenSearch={() => setIsSearchOpen(true)}
            onMenuToggle={() => setIsMobileMenuOpen(true)}
          />
          <main className="p-4 sm:p-8 flex-1 overflow-y-auto print:overflow-visible bg-[#F4F6FB]">
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
