import { Injectable, Injector } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { PdfStorage } from './pdf-storage.service';
import { FileOpener } from './file-opener.service';

/** Nombre que se puede escribir en disco: sin barras ni caracteres raros (los adjuntos los nombra quien los sube). */
export function nombreFicheroSeguro(nombre: string): string {
  const limpio = (nombre || 'fichero').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9._-]+/g, '_');
  return limpio.replace(/^_+|_+$/g, '') || 'fichero';
}

/**
 * NestoApp#218 (y #223, #226): abre un fichero descargado (PDF o imagen) con el visor del sistema.
 * En el móvil se guarda como las facturas (PdfStorage) y se abre con FileOpener; en el navegador
 * (ionic serve) se abre en otra pestaña.
 */
@Injectable({ providedIn: 'root' })
export class VisorFicheros {
  // PdfStorage depende del File de Cordova, que no se provee en raíz: se pide solo al usarlo en el móvil.
  constructor(private injector: Injector, private fileOpener: FileOpener) { }

  async abrir(blob: Blob, nombre: string, tipo?: string): Promise<void> {
    const mime = tipo || blob.type || 'application/octet-stream';
    if (Capacitor.isNativePlatform()) {
      const ruta = await this.injector.get(PdfStorage).savePdfBlob(blob, nombreFicheroSeguro(nombre));
      await this.fileOpener.open(ruta, mime);
      return;
    }
    const url = URL.createObjectURL(blob.type ? blob : new Blob([blob], { type: mime }));
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60 * 1000);
  }
}
