import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { FirebaseAnalytics as CapacitorAnalytics } from '@capacitor-firebase/analytics';

@Injectable({ providedIn: 'root' })
export class FirebaseAnalytics {
  logEvent(name: string, params: any = {}): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.log('[Analytics] logEvent:', name, params);
      return Promise.resolve();
    }
    return CapacitorAnalytics.logEvent({ name, params }).catch(err => {
      console.error('Error logging analytics event:', err);
    });
  }

  setUserId(userId: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return Promise.resolve();
    }
    return CapacitorAnalytics.setUserId({ userId }).catch(err => {
      console.error('Error setting analytics userId:', err);
    });
  }

  setCurrentScreen(screenName: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return Promise.resolve();
    }
    return CapacitorAnalytics.setCurrentScreen({ screenName }).catch(err => {
      console.error('Error setting current screen:', err);
    });
  }
}
