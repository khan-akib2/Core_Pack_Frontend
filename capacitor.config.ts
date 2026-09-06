import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.corepackindia.app',
  appName: 'CorePack',
  webDir: 'public',
  // Production Configuration: Load the hosted web application directly.
  // For local Android emulator development, comment this out and use:
  // url: 'http://10.0.2.2:3000', cleartext: true
  server: {
    url: 'https://core-pack-india.vercel.app',
    errorPath: 'offline.html'
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    CapacitorCookies: {
      enabled: true
    },
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
