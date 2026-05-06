import { Injectable } from '@angular/core';
import { File } from '@awesome-cordova-plugins/file/ngx';

/**
 * Guarda un blob como archivo PDF en disco y devuelve el path absoluto.
 *
 * Usa cordova-plugin-file (externalDataDirectory) en ambos APKs:
 * - APK Capacitor 8.x: el plugin Cordova se incluye por compatibilidad y
 *   escribe correctamente. (Probado en logcat: el MediaScanner indexa el
 *   archivo recién escrito.)
 * - APK Cordova viejo (2.1.2): nativo del binario.
 *
 * El path resultante (file:///storage/emulated/0/Android/data/<pkg>/files/...)
 * lo abre directamente cordova.plugins.fileOpener2, cuyo FileProvider sí
 * cubre external-files-path en ambos APKs.
 *
 * NO usar @capacitor/filesystem aquí: writeFile con base64 cuelga la app
 * en algunos dispositivos (Samsung/Realme con Capacitor 8.1). Y NO usar
 * @capacitor-community/file-opener: su FileProvider de Capacitor no
 * incluye external-files-path y falla con FileUriExposedException.
 */
@Injectable({ providedIn: 'root' })
export class PdfStorage {
  constructor(private file: File) {}

  async savePdfBlob(blob: Blob, fileName: string): Promise<string> {
    await this.file.writeFile(this.file.externalDataDirectory, fileName, blob, { replace: true });
    return this.file.externalDataDirectory + fileName;
  }
}
