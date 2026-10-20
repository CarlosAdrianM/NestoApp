import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Keyboard as CapacitorKeyboard } from '@capacitor/keyboard';

@Injectable({ providedIn: 'root' })
export class Keyboard {
  static readonly MAXIMO_ESPERA_CIERRE_MS = 800;

  /** Entre keyboardWillShow y keyboardDidHide: abierto o abriéndose. */
  private visible = false;

  constructor() {
    if (Capacitor.isNativePlatform()) {
      CapacitorKeyboard.addListener('keyboardWillShow', () => this.visible = true);
      CapacitorKeyboard.addListener('keyboardDidHide', () => this.visible = false);
    }
  }

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

  /**
   * Quita el foco y el teclado, y no vuelve hasta que el teclado se ha ido (o pasa el máximo).
   * Para abrir una hoja (ion-modal con breakpoints): si el teclado sale mientras se anima, la hoja
   * se queda a medias y no se puede cerrar ni tocar nada (NestoApp 2.25.1, «Puede ofrecer»).
   */
  async cerrar(): Promise<void> {
    (document.activeElement as HTMLElement)?.blur?.();
    if (!Capacitor.isNativePlatform()) {
      return;
    }
    if (!this.visible) {
      this.hide();
      return;
    }
    await new Promise<void>(resolve => {
      let escucha: { remove: () => Promise<void> } | null = null;
      let terminado = false;
      const terminar = () => {
        if (terminado) {
          return;
        }
        terminado = true;
        clearTimeout(temporizador);
        escucha?.remove();
        resolve();
      };
      const temporizador = setTimeout(terminar, Keyboard.MAXIMO_ESPERA_CIERRE_MS);
      CapacitorKeyboard.addListener('keyboardDidHide', terminar).then(h => {
        escucha = h;
        if (terminado) {
          h.remove();
        }
      });
      this.hide();
    });
  }
}
