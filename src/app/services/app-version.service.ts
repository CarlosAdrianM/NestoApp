import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

@Injectable({ providedIn: 'root' })
export class AppVersion {
  async getVersionNumber(): Promise<string> {
    if (!Capacitor.isNativePlatform()) {
      return 'web';
    }
    const info = await App.getInfo();
    return info.version;
  }

  async getAppName(): Promise<string> {
    if (!Capacitor.isNativePlatform()) {
      return 'Nesto';
    }
    const info = await App.getInfo();
    return info.name;
  }

  async getPackageName(): Promise<string> {
    if (!Capacitor.isNativePlatform()) {
      return 'com.ionicframework.nestoapp958858';
    }
    const info = await App.getInfo();
    return info.id;
  }

  async getVersionCode(): Promise<string | number> {
    if (!Capacitor.isNativePlatform()) {
      return 0;
    }
    const info = await App.getInfo();
    return info.build;
  }
}
