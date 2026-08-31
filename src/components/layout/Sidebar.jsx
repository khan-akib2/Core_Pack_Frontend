'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  LayoutDashboard,
  FileText,
  Package,
  Users,
  Truck,
  BarChart3,
  Settings,
  FileCode,
  Bell,
  Database,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotificationsSync } from '@/lib/notificationsSync';
import { motion, AnimatePresence } from 'framer-motion';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Notifications', href: '/notifications', icon: Bell, showBadge: true },
  { name: 'Tax Invoices', href: '/invoices', icon: FileText },
  { name: 'Quotations', href: '/quotations', icon: FileCode },
  { name: 'Delivery Challans', href: '/delivery-challans', icon: Truck },
  { name: 'Product Catalog', href: '/products', icon: Package },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Reports & Tax', href: '/reports', icon: BarChart3 },
  { name: 'Database Backups', href: '/backups', icon: Database },
  { name: 'Company Settings', href: '/settings', icon: Settings }
];

export default function Sidebar({ isMobileOpen, onCloseMobile }) {
  const pathname = usePathname();
  const { readUntil, clearedAt } = useNotificationsSync();

  const { data: notificationRes } = useQuery({
    queryKey: ['notificationsList'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data;
    },
    refetchInterval: 15000
  });

  const { data: companyRes } = useQuery({
    queryKey: ['companySettings'],
    queryFn: async () => {
      const res = await api.get('/company');
      return res.data.data;
    }
  });

  const company = companyRes || {};

  const rawNotifications = notificationRes?.data || [];
  const notifications = rawNotifications.filter(n => new Date(n.createdAt).getTime() > clearedAt);
  const unreadCount = notifications.filter(n => new Date(n.createdAt).getTime() > readUntil).length;

  const sidebarContent = (
    <aside className="w-60 bg-[#0B132A] flex flex-col justify-between shrink-0 text-white h-full py-5 pl-3.5 pr-0 border-r-0 antialiased">
      <div>
        {/* Logo Container */}
        <div className="flex items-center justify-between mr-3.5 mb-6">
          <div className="flex items-center space-x-3 px-2 py-1 flex-1 min-w-0">
            <div className="bg-white p-1.5 rounded-xl shadow-lg shadow-black/20 shrink-0">
              <img src="/branding/logo.png" alt="Logo" className="h-6 w-auto object-contain" />
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <h1 className="font-bold text-white text-[15px] leading-none tracking-tight truncate">
                {company?.companyName || 'CORE PACK'}
              </h1>
              <p className="text-[10px] text-slate-400 font-medium mt-1 truncate">Business Portal</p>
            </div>
          </div>
          {onCloseMobile && (
            <button onClick={onCloseMobile} className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg shrink-0">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Menu Links */}
        <nav className="space-y-1 relative">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <div key={item.name} className="relative">
                <Link
                  href={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 text-[13.5px] transition-all duration-150 group relative z-10",
                    isActive
                      ? "bg-[#F4F6FB] text-slate-900 font-semibold lg:rounded-l-xl lg:rounded-r-none rounded-xl mr-3.5 lg:mr-0 shadow-2xs"
                      : "text-slate-300 hover:text-white hover:bg-white/10 rounded-xl mr-3.5 font-medium"
                  )}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <Icon
                      strokeWidth={1.8}
                      className={cn(
                        "w-4.5 h-4.5 shrink-0 transition-colors duration-150",
                        isActive ? "text-orange-500" : "text-slate-400 group-hover:text-white"
                      )}
                    />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.showBadge && unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-extrabold bg-orange-500 text-white rounded-full ml-2 shrink-0 animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* MoveX Inverted Corner Cutouts connecting seamlessly to canvas */}
                {isActive && (
                  <>
                    <svg className="hidden lg:block absolute -top-4 right-0 w-4 h-4 text-[#F4F6FB] pointer-events-none z-0" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 16H0C8.83656 16 16 8.83656 16 0V16Z" fill="currentColor"/>
                    </svg>
                    <svg className="hidden lg:block absolute -bottom-4 right-0 w-4 h-4 text-[#F4F6FB] pointer-events-none z-0" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 0H0C8.83656 0 16 7.16344 16 16V0Z" fill="currentColor"/>
                    </svg>
                  </>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile Card */}
      <div className="bg-[#070C18] p-3.5 rounded-xl border border-slate-800/80 text-xs mr-3.5 relative overflow-hidden group shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shrink-0 border border-slate-600 shadow-inner">
            <span className="text-xs font-bold text-slate-200">
              {(company?.companyName || 'CP').substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-slate-200 leading-tight truncate">{company?.companyName || 'Core Pack India'}</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{company?.gstin ? `GST: ${company.gstin}` : 'Setup GSTIN in Settings'}</p>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:block h-screen sticky top-0 z-30 print:hidden">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
              onClick={onCloseMobile}
            ></motion.div>
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="relative z-10 h-full max-w-xs"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
