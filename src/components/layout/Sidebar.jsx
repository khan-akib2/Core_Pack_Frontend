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
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotificationsSync } from '@/lib/notificationsSync';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Notifications', href: '/notifications', icon: Bell, showBadge: true },
  { name: 'Tax Invoices', href: '/invoices', icon: FileText },
  { name: 'Quotations', href: '/quotations', icon: FileCode },
  { name: 'Delivery Challans', href: '/delivery-challans', icon: Truck },
  { name: 'Product Catalog', href: '/products', icon: Package },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Reports & Tax', href: '/reports', icon: BarChart3 },
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

  const rawNotifications = notificationRes?.data || [];
  const notifications = rawNotifications.filter(n => new Date(n.createdAt).getTime() > clearedAt);
  const unreadCount = notifications.filter(n => new Date(n.createdAt).getTime() > readUntil).length;

  const sidebarContent = (
    <aside className="w-60 bg-[#0B132A] flex flex-col justify-between shrink-0 text-white h-full py-5 pl-3.5 pr-0 border-r-0 antialiased">
      <div>
        {/* Logo Container */}
        <div className="flex items-center justify-between mr-3.5 mb-6">
          <div className="flex items-center space-x-3 px-3 py-2.5 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md flex-1">
            <img src="/logo.png" alt="Core Pack Logo" className="h-8 w-auto bg-white rounded-md p-1 shadow-2xs object-contain" />
            <div>
              <h1 className="font-bold text-white text-[14px] leading-none tracking-tight">CORE PACK</h1>
              <p className="text-[9.5px] text-orange-400 font-semibold tracking-widest mt-1">INDIA v1.0</p>
            </div>
          </div>
          {onCloseMobile && (
            <button onClick={onCloseMobile} className="lg:hidden p-1.5 ml-2 text-slate-400 hover:text-white rounded-lg">
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
                      ? "bg-[#F4F6FB] text-slate-900 font-semibold rounded-l-xl mr-0 shadow-2xs"
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
                    <div className="absolute -top-4 right-0 w-4 h-4 bg-[#F4F6FB] pointer-events-none z-0">
                      <div className="w-full h-full bg-[#0B132A] rounded-br-2xl"></div>
                    </div>
                    <div className="absolute -bottom-4 right-0 w-4 h-4 bg-[#F4F6FB] pointer-events-none z-0">
                      <div className="w-full h-full bg-[#0B132A] rounded-tr-2xl"></div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile Card */}
      <div className="bg-[#070C18] p-3 rounded-xl border border-slate-800/80 text-xs mr-3.5">
        <p className="text-xs font-semibold text-slate-200 leading-tight">Core Pack India</p>
        <p className="text-[10.5px] text-slate-400 font-mono mt-0.5">GST: 27AMSPK9622Q1ZZ</p>
        <div className="mt-2 flex items-center space-x-1.5 text-[9.5px] text-orange-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Real-time Live Sync</span>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:block h-screen sticky top-0 z-30">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          ></div>
          <div className="relative z-10 h-full max-w-xs animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
