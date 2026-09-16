'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

export function CapacitorInit() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      try {
        StatusBar.setOverlaysWebView({ overlay: false });
      } catch (e) {
        console.warn('CapacitorInit StatusBar error:', e);
      }
    }
  }, []);

  return null;
}

