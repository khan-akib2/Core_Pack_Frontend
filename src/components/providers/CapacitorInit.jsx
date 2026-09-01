'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

export function CapacitorInit() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Hide splash screen after app has fully mounted and is ready
      SplashScreen.hide().catch(console.error);
      
      // Set the status bar to match the app header
      StatusBar.setStyle({ style: Style.Light }).catch(console.error);
      StatusBar.setBackgroundColor({ color: '#ffffff' }).catch(console.error);
    }
  }, []);

  return null;
}
