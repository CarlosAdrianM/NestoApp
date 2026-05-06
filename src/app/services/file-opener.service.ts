import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { FileOpener as CapFileOpener } from '@capacitor-community/file-opener';

@Injectable({ providedIn: 'root' })
export class FileOpener {
  open(filePath: string, mimeType: string): Promise<any> {
    // APK Capacitor (2.17.3+): plugin nativo de Capacitor.
    if (Capacitor.isPluginAvailable('FileOpener')) {
      return CapFileOpener.open({ filePath, contentType: mimeType });
    }
    // APK Cordova viejo (2.1.2): cordova-plugin-file-opener2 sigue ahí porque
    // los binarios antiguos lo tienen en su manifest. Lo invocamos
    // directamente desde window.cordova porque no hay wrapper Angular
    // instalado para ese plugin.
    return new Promise((resolve, reject) => {
      const fo = (window as any).cordova?.plugins?.fileOpener2;
      if (!fo) {
        reject(new Error('No file opener plugin available on this platform'));
        return;
      }
      fo.open(filePath, mimeType, { error: reject, success: resolve });
    });
  }
}
