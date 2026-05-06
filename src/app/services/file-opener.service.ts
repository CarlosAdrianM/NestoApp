import { Injectable } from '@angular/core';

/**
 * Abre un archivo en el visor del sistema vía cordova-plugin-file-opener2.
 *
 * Llama directamente a window.cordova.plugins.fileOpener2 (no hay wrapper
 * Angular instalado) porque ese plugin Cordova registra su PROPIO
 * FileProvider que cubre external-files-path / external-cache-path /
 * files-path / cache-path / external-path. El plugin está incluido tanto
 * en APK Cordova viejo (2.1.2) como en APK Capacitor 8.x (vía compat).
 *
 * NO usar @capacitor-community/file-opener: su FileProvider de Capacitor
 * declara solo external-path y cache-path, y falla con FileUriExposedException
 * silenciosa cuando el path está en external-files-path
 * (externalDataDirectory).
 */
@Injectable({ providedIn: 'root' })
export class FileOpener {
  open(filePath: string, mimeType: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const fo = (window as any).cordova?.plugins?.fileOpener2;
      if (!fo) {
        reject(new Error('cordova.plugins.fileOpener2 no disponible en esta plataforma'));
        return;
      }
      fo.open(filePath, mimeType, { error: reject, success: resolve });
    });
  }
}
