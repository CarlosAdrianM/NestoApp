import { Injectable } from '@angular/core';
import { FileOpener as CapFileOpener } from '@capacitor-community/file-opener';

/**
 * Abre un archivo en el visor del sistema.
 *
 * Usa @capacitor-community/file-opener (incluido en el APK Capacitor 2.17.3+).
 * El plugin busca el FileProvider declarado por Capacitor para construir
 * un content URI seguro y lanza el Intent ACTION_VIEW.
 *
 * IMPORTANTE: el path debe pasarse SIN el prefix "file://" porque el
 * plugin lo trata como path absoluto. Pasarlo con prefix hacía que el
 * plugin no encontrara coincidencia con el FileProvider y fallaba con
 * FileUriExposedException silenciosa (el síntoma era "loading desaparece
 * sin abrir el PDF" en bundle 2.17.0).
 *
 * Fallback a cordova.plugins.fileOpener2 (APK Cordova viejo 2.1.2): no se
 * usa, ese plugin Cordova no se carga en runtime aunque su FileProvider
 * esté en el manifest. Si llegamos aquí en un APK donde tampoco está
 * @capacitor-community/file-opener, lanzamos error claro para que el
 * componente lo enseñe en alert.
 */
@Injectable({ providedIn: 'root' })
export class FileOpener {
  open(filePath: string, mimeType: string): Promise<any> {
    const cleanPath = filePath.replace(/^file:\/\//, '');
    return CapFileOpener.open({ filePath: cleanPath, contentType: mimeType });
  }
}
