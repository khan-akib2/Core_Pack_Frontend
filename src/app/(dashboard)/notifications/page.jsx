'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { useNotificationsSync, markAllNotificationsRead, clearAllNotifications } from '@/lib/notificationsSync';
import { 
  Bell, 
  FileText, 
  CreditCard, 
  Truck, 
  FileCode, 
  CheckCheck, 
  Trash2, 
  Search,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'unread', 'read'
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { readUntil, clearedAt } = useNotificationsSync();

  const { data: notificationRes, isLoading } = useQuery({
    queryKey: ['notificationsList'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data;
    },
    refetchInterval: 15000
  });

  const rawNotifications = notificationRes?.data || [];
  const notifications = rawNotifications.filter(n => new Date(n.createdAt).getTime() > clearedAt);

  const getIcon = (type) => {
    switch (type) {
      case 'invoice':
        return <FileText className="w-5 h-5 text-orange-500" />;
      case 'payment':
        return <CreditCard className="w-5 h-5 text-emerald-500" />;
      case 'challan':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'quotation':
        return <FileCode className="w-5 h-5 text-amber-500" />;
      default:
        return <Bell className="w-5 h-5 text-orange-500" />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    const isNew = new Date(n.createdAt).getTime() > readUntil;
    if (activeTab === 'unread' && !isNew) return false;
    if (activeTab === 'read' && isNew) return false;

    if (typeFilter !== 'all' && n.type !== typeFilter) return false;

    if (search.trim()) {
      const query = search.toLowerCase();
      const matchTitle = n.title?.toLowerCase().includes(query);
      const matchMsg = n.message?.toLowerCase().includes(query);
      if (!matchTitle && !matchMsg) return false;
    }

    return true;
  });

  const unreadCount = notifications.filter(n => new Date(n.createdAt).getTime() > readUntil).length;
  const readCount = notifications.length - unreadCount;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 antialiased">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-orange-500" />
            System Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage and review all system alerts, dispatches, invoices, and sales updates.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllNotificationsRead}>
              <CheckCheck className="w-4 h-4 mr-1.5 text-orange-500" />
              Mark All Read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllNotifications} className="text-rose-600 hover:bg-rose-50">
              <Trash2 className="w-4 h-4 mr-1.5" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Filter & Search Controls */}
      <Card className="p-4 border-slate-200/80 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Navigation Tabs */}
          <div className="flex items-center p-1 bg-slate-100/80 rounded-xl w-fit border border-slate-200/60">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All Notifications ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'unread'
                  ? 'bg-white text-orange-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              New / Unread
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] bg-orange-500 text-white rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('read')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'read'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Previous / Read ({readCount})
            </button>
          </div>

          <div className="flex items-center space-x-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/90 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-orange-500 focus:outline-none transition-all"
              />
            </div>

            <Select
              containerClassName="w-36 shrink-0"
              className="text-xs py-2"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="invoice">Invoices</option>
              <option value="challan">Challans</option>
              <option value="quotation">Quotations</option>
              <option value="payment">Payments</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Notifications List Card */}
      <Card className="border-slate-200/80 overflow-hidden divide-y divide-slate-100">
        {isLoading ? (
          <p className="text-xs text-slate-500 text-center py-12">Loading notifications...</p>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No Notifications Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              There are no notifications matching your current filters.
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const isNew = new Date(n.createdAt).getTime() > readUntil;
            return (
              <div
                key={n.id}
                onClick={() => {
                  if (n.link) router.push(n.link);
                }}
                className={`p-4 transition-colors flex items-start justify-between space-x-4 cursor-pointer group ${
                  isNew ? 'bg-orange-50/40 hover:bg-orange-50/80' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                  <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 shrink-0 mt-0.5 group-hover:border-orange-300 group-hover:bg-white transition-colors">
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                        {n.title}
                      </h4>
                      {isNew ? (
                        <Badge variant="warning" className="text-[10px] py-0 px-1.5">New</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-slate-400">Read</Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] font-mono text-slate-400 mt-1.5">
                      Timestamp: {formatDate(n.createdAt)}
                    </p>
                  </div>
                </div>

                {n.link && (
                  <div className="flex items-center text-xs font-bold text-slate-400 group-hover:text-orange-600 transition-colors shrink-0 self-center">
                    <span>View</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </Card>
    </div>
  );
}
