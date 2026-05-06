import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { File } from '@awesome-cordova-plugins/file/ngx';

@Injectable({ providedIn: 'root' })
export class PdfStorage {
  constructor(private file: File) {}

  /**
   * Guarda un blob como archivo en disco y devuelve un path/URI que
   * @capacitor-community/file-opener (en APK Capacitor) o
   * cordova-plugin-file-opener2 (en APK Cordova) pueden abrir.
   *
   * En APK Capacitor 8 sobre Android 11+, el plugin Cordova file con
   * externalDataDirectory escribe correctamente el archivo, pero el path
   * resultante no está cubierto por el FileProvider que Capacitor configura,
   * y el FileOpener falla silenciosamente al intentar lanzar el Intent
   * (FileUriExposedException). Por eso aquí usamos @capacitor/filesystem
   * con Directory.Cache cuando el plugin está disponible — el URI que
   * devuelve sí lo expone Capacitor correctamente.
   */
  async savePdfBlob(blob: Blob, fileName: string): Promise<string> {
    if (Capacitor.isPluginAvailable('Filesystem')) {
      const base64 = await this.blobToBase64(blob);
      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Cache
      });
      return result.uri;
    }
    // Fallback: APK Cordova viejo sin plugins Capacitor nativos
    await this.file.writeFile(this.file.externalDataDirectory, fileName, blob, { replace: true });
    return this.file.externalDataDirectory + fileName;
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // result tiene formato "data:application/pdf;base64,XXXX"; quitamos el prefijo
        const commaIndex = result.indexOf(',');
        resolve(commaIndex >= 0 ? result.substring(commaIndex + 1) : result);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }
}
