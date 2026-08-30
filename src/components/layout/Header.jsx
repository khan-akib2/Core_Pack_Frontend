'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, LogOut, User as UserIcon, FileText, CreditCard, Truck, FileCode, X, CheckCheck, Menu, ChevronDown, Settings, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useNotificationsSync, markAllNotificationsRead, clearAllNotifications } from '@/lib/notificationsSync';
import { AnimatePresence, motion } from 'framer-motion';

export default function Header({ onOpenSearch, onMenuToggle }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const { readUntil, clearedAt } = useNotificationsSync();

  const { data: notificationRes } = useQuery({
    queryKey: ['notificationsList'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data;
    },
    refetchInterval: 15000
  });

  const rawNotifications = notificationRes?.data || [];
  const notifications = rawNotifications.filter(n => new Date(n.createdAt).getTime() > clearedAt);
  const unreadCount = notifications.filter(n => new Date(n.createdAt).getTime() > readUntil).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsNotificationOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const storedRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('cp_refresh_token') : null;
      await api.post('/auth/logout', {}, {
        headers: storedRefreshToken ? { 'x-refresh-token': storedRefreshToken } : {}
      });
    } catch (error) {
      console.error('Logout API failed:', error);
    }
    logout();
    router.push('/login');
  };

  const handleNotificationClick = (link) => {
    markAllNotificationsRead();
    setIsNotificationOpen(false);
    if (link) router.push(link);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'invoice':
        return <FileText className="w-4 h-4 text-orange-500" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-emerald-500" />;
      case 'challan':
        return <Truck className="w-4 h-4 text-blue-500" />;
      case 'quotation':
        return <FileCode className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-orange-500" />;
    }
  };

  return (
    <header className="h-16 sm:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 antialiased print:hidden">
      <div className="flex items-center space-x-3 flex-1 max-w-md min-w-0">
        {/* Mobile Menu Hamburger Button */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Input Pill */}
        <button
          onClick={onOpenSearch}
          type="button"
          className="w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-slate-100/90 border border-slate-200/80 text-slate-500 hover:bg-white hover:border-orange-400/60 hover:shadow-md transition-all text-xs sm:text-sm group min-w-0"
        >
          <div className="flex items-center space-x-2 min-w-0">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors shrink-0" />
            <span className="text-slate-600 font-medium truncate">Search database...</span>
          </div>
          <kbd className="hidden md:inline-block px-2 py-0.5 text-[10px] font-extrabold text-slate-400 bg-white border border-slate-200 rounded-md shadow-2xs shrink-0">
            Ctrl K
          </kbd>
        </button>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4 ml-2 shrink-0">
        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          className="p-2 sm:p-2.5 rounded-full bg-white text-slate-500 border border-slate-200/80 hover:text-orange-500 hover:border-slate-300 hover:shadow-xs transition-all"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4.5 h-4.5 sm:w-5 sm:h-5 ${isRefreshing ? 'animate-spin text-orange-500' : ''}`} />
        </button>

        {/* Notification Bell Container */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            type="button"
            className={`p-2 sm:p-2.5 rounded-full border shadow-2xs transition-all relative ${
              isNotificationOpen ? 'bg-orange-50 text-orange-600 border-orange-300' : 'bg-white text-slate-600 border-slate-200/80 hover:text-orange-500 hover:border-slate-300 hover:shadow-xs'
            }`}
            title="System Notifications"
          >
            <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] sm:min-w-[20px] h-[18px] sm:h-[20px] text-[9px] sm:text-[10px] font-black text-white bg-orange-500 border-2 border-white rounded-full flex items-center justify-center shadow-2xs animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
          {isNotificationOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute right-[-60px] sm:right-0 mt-3 w-[340px] sm:w-96 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <h3 className="text-[10px] sm:text-xs font-bold text-slate-900 uppercase tracking-wider">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold bg-orange-100 text-orange-700 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[10px] sm:text-[11px] font-semibold text-slate-500 hover:text-rose-600 transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[10px] sm:text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center"
                    >
                      <CheckCheck className="w-3.5 h-3.5 sm:mr-1" /> <span className="hidden sm:inline">Mark read</span>
                    </button>
                  )}
                  <button onClick={() => setIsNotificationOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">No system notifications.</p>
                ) : (
                  notifications.map((n) => {
                    const isNew = new Date(n.createdAt).getTime() > readUntil;
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n.link)}
                        className={`p-3 cursor-pointer transition-colors flex items-start space-x-3 group ${
                          isNew ? 'bg-orange-50/40 hover:bg-orange-50/80' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 shrink-0 mt-0.5 group-hover:border-orange-300">
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5">
                              <p className="text-xs font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{n.title}</p>
                              {isNew && <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>}
                            </div>
                            <span className="text-[9px] font-mono text-slate-400">{formatDate(n.createdAt)}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug truncate">{n.message}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>

        <div className="h-6 w-px bg-slate-200"></div>

        {/* Redesigned Modern Profile Card */}
        <div className="relative shrink-0" ref={profileDropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            type="button"
            className="flex items-center p-1.5 bg-gradient-to-b from-white to-slate-50/90 border border-slate-200/90 hover:border-orange-300 rounded-full shadow-2xs hover:shadow-xs transition-all group shrink-0"
          >
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-900 to-slate-800 text-white font-bold flex items-center justify-center text-[13px] shadow-xs border border-white/20 group-hover:from-orange-600 group-hover:to-orange-500 transition-colors">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>

            <div className="hidden sm:block text-left min-w-0 ml-3 mr-1">
              <div className="flex items-center space-x-1">
                <span className="text-xs font-bold text-slate-900 leading-tight group-hover:text-orange-600 transition-colors truncate block max-w-[130px]">
                  {user?.name || 'CorePack Admin'}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 flex items-center truncate max-w-[130px]">
                <ShieldCheck className="w-3 h-3 text-orange-500 mr-0.5 inline shrink-0" />
                <span className="truncate">{user?.role || 'System Administrator'}</span>
              </span>
            </div>

            <div className="hidden sm:flex items-center justify-center w-6 h-6 rounded-full hover:bg-slate-100 ml-1">
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${isProfileOpen ? 'rotate-180 text-orange-500' : ''}`} />
            </div>
          </button>

          {/* Profile Dropdown Popover */}
          <AnimatePresence>
          {isProfileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute right-0 mt-3 w-56 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-50 overflow-hidden p-1.5"
            >
              <div className="p-3 border-b border-slate-100 bg-slate-50/60 rounded-xl mb-1">
                <p className="text-xs font-bold text-slate-900">{user?.name || 'CorePack Admin'}</p>
                <p className="text-[10.5px] text-slate-500 truncate mt-0.5">{user?.email || 'admin@corepackindia.com'}</p>
              </div>

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  router.push('/settings');
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400 group-hover:text-orange-500" />
                <span>Company Settings</span>
              </button>

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  router.push('/notifications');
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
              >
                <Bell className="w-4 h-4 text-slate-400 group-hover:text-orange-500" />
                <span>All Notifications</span>
              </button>

              <div className="h-px bg-slate-100 my-1"></div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out Account</span>
              </button>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
