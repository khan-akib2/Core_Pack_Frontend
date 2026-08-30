'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RefreshCw, LogOut, CheckCircle2, AlertTriangle, Smartphone, Power } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';

export default function WhatsAppSettingsPage() {
  const queryClient = useQueryClient();

  const { data: whatsapp, isLoading, error, refetch } = useQuery({
    queryKey: ['whatsappStatus'],
    queryFn: async () => {
      const res = await api.get(`/whatsapp/status?t=${Date.now()}`);
      return res.data.data;
    },
    // Continuously poll every 2 seconds unless connected, so state transitions (e.g. INITIALIZING -> QR_READY) reflect in real-time
    refetchInterval: (query) => {
      const data = query?.state?.data;
      if (data?.status === 'READY' || data?.status === 'AUTHENTICATED') {
        return 10000; // Connected: poll every 10s
      }
      return 2000; // Not ready yet (INITIALIZING, QR_READY, DISCONNECTED): poll every 2s
    }
  });

  const { data: company } = useQuery({
    queryKey: ['companySettings'],
    queryFn: async () => {
      const res = await api.get('/company');
      return res.data.data;
    }
  });

  const formatWhatsAppNumber = (num) => {
    if (!num) return 'Unknown';
    const cleaned = num.replace(/\D/g, '');
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
    }
    return `+${cleaned}`;
  };

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/whatsapp/logout');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsappStatus'] });
      refetch();
    }
  });

  const reconnectMutation = useMutation({
    mutationFn: async () => {
      await api.post('/whatsapp/reconnect');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsappStatus'] });
      refetch();
    }
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleReconnect = () => {
    reconnectMutation.mutate();
  };

  if (isLoading) return <p className="text-slate-400 p-8 text-center text-xs font-medium">Loading WhatsApp Status...</p>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 antialiased">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">WhatsApp Integration</h1>
          <p className="text-xs text-slate-500 mt-0.5">Link your business WhatsApp to automatically send documents.</p>
        </div>
        <Link href="/settings">
          <Button variant="outline" className="text-xs">
            Back to General Settings
          </Button>
        </Link>
      </div>

      <Card className="p-6 border-slate-200/80 space-y-5">
        <h2 className="text-sm font-bold text-green-600 border-b border-slate-100 pb-2 flex items-center gap-2">
          <Smartphone className="w-4 h-4" /> Device Status
        </h2>

        {error ? (
          <div className="p-4 bg-rose-50 rounded-xl text-rose-700 text-sm flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p>Failed to connect to the WhatsApp Service. Ensure the backend server is running.</p>
            </div>
            <Button onClick={() => refetch()} variant="outline" className="text-xs text-rose-700 border-rose-200 bg-white hover:bg-rose-100">
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            
            {whatsapp?.status === 'READY' || whatsapp?.status === 'AUTHENTICATED' ? (
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">WhatsApp is Connected!</h3>
                <p className="text-sm text-slate-500 max-w-md">
                  Your CorePack application is successfully linked. You can now send Invoices, Quotations, and Challans directly to your customers' WhatsApp numbers.
                </p>
                {whatsapp.info && (
                  <div className="w-full max-w-sm mt-4 text-left border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                    <div className="bg-slate-50 px-4 py-3">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Connected Number</p>
                      <p className="text-base font-semibold text-slate-900 font-mono tracking-tight">{formatWhatsAppNumber(whatsapp.info.wid?.user)}</p>
                    </div>
                    <div className="bg-white px-4 py-3">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Account / Business</p>
                      <p className="text-sm font-medium text-slate-800">{company?.companyName || whatsapp.info.pushname || 'CorePack India'}</p>
                    </div>
                  </div>
                )}
                <Button onClick={handleLogout} disabled={logoutMutation.isPending} variant="outline" className="mt-4 text-rose-600 border-rose-200 hover:bg-rose-50">
                  <LogOut className="w-4 h-4 mr-2" /> Disconnect WhatsApp
                </Button>
              </div>
            ) : whatsapp?.status === 'QR_READY' && whatsapp?.qrCode ? (
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900">Scan to Link WhatsApp</h3>
                  <p className="text-sm text-slate-500 max-w-sm">
                    Open WhatsApp on your phone, tap <strong>Menu</strong> or <strong>Settings</strong> and select <strong>Linked Devices</strong>. Tap <strong>Link a Device</strong> and point your phone to this screen to capture the code.
                  </p>
                </div>
                
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200 inline-block">
                  <QRCodeSVG value={whatsapp.qrCode} size={256} />
                </div>
              </div>
            ) : whatsapp?.status === 'INITIALIZING' ? (
              <div className="flex flex-col items-center text-center space-y-4 text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin text-green-500 mb-2" />
                <h3 className="text-base font-semibold text-slate-700">Starting WhatsApp Engine...</h3>
                <p className="text-xs max-w-sm">
                  Please wait while the secure WhatsApp container initializes. The QR code will appear automatically once ready.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center space-y-4 text-slate-600">
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-1">
                  <Power className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-800">WhatsApp Engine Offline / Disconnected</h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  The WhatsApp service is currently disconnected. Click below to initialize the WhatsApp engine and generate a QR code.
                </p>

                {whatsapp?.lastError && (
                  <div className="bg-amber-50/70 border border-amber-200 text-amber-800 px-3 py-2 rounded-lg text-xs font-mono max-w-md">
                    {whatsapp.lastError}
                  </div>
                )}

                <Button 
                  onClick={handleReconnect} 
                  disabled={reconnectMutation.isPending} 
                  className="bg-green-600 hover:bg-green-700 text-white font-medium text-xs px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${reconnectMutation.isPending ? 'animate-spin' : ''}`} />
                  {reconnectMutation.isPending ? 'Initializing...' : 'Start / Reconnect WhatsApp Engine'}
                </Button>
              </div>
            )}
            
          </div>
        )}
      </Card>
    </div>
  );
}
