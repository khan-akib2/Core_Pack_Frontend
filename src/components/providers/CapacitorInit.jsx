'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export function CapacitorInit() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Configuration is handled natively via capacitor.config.ts and Android theme
    }
  }, []);

  return null;
}
