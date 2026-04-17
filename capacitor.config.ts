import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ionicframework.nestoapp958858',
  appName: 'Nesto',
  webDir: 'www',
  plugins: {
    LiveUpdates: {
      appId: '4652a4e8',
      channel: 'Master',
      autoUpdateMethod: 'background',
      maxVersions: 2
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: false
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  },
  cordova: {
    preferences: {
      ScrollEnabled: 'false',
      BackupWebStorage: 'none'
    }
  }
};

export default config;
