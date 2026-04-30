import { Injectable } from '@angular/core';
import { FileOpener as CapFileOpener } from '@capacitor-community/file-opener';

@Injectable({ providedIn: 'root' })
export class FileOpener {
  open(filePath: string, mimeType: string): Promise<any> {
    return CapFileOpener.open({ filePath, contentType: mimeType });
  }
}
