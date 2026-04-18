import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Keyboard as CapacitorKeyboard } from '@capacitor/keyboard';

@Injectable({ providedIn: 'root' })
export class Keyboard {
  show(): void {
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
      CapacitorKeyboard.show().catch(err => console.warn('Keyboard.show error:', err));
    }
  }

  hide(): void {
    if (Capacitor.isNativePlatform()) {
      CapacitorKeyboard.hide().catch(err => console.warn('Keyboard.hide error:', err));
    }
  }
}
