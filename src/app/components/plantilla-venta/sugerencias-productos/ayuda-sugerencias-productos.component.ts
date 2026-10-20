import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

/**
 * NestoApp#235: «¿Cómo funciona?» de las sugerencias. Es la guía de Nesto
 * (NestoAPI/Documentacion/GuiaSugerenciasPlantilla.html) adaptada al móvil. Va dentro de la app para
 * que funcione sin conexión y corresponda siempre a la versión que tiene cada vendedor.
 */
@Component({
  selector: 'ayuda-sugerencias-productos',
  templateUrl: './ayuda-sugerencias-productos.component.html',
  styleUrls: ['./sugerencias-productos.component.scss'],
  standalone: false
})
export class AyudaSugerenciasProductosComponent {
  /** Marca en el dispositivo: la ayuda sale sola solo la primera vez que se abren las sugerencias. */
  static readonly CLAVE_VISTA = 'NestoApp.ayudaSugerenciasProductosVista';

  constructor(private modalCtrl: ModalController) { }

  public cerrar(): void {
    this.modalCtrl.dismiss();
  }

  static yaVista(): boolean {
    try {
      return localStorage.getItem(AyudaSugerenciasProductosComponent.CLAVE_VISTA) === '1';
    } catch {
      return true; // sin almacenamiento, mejor no sacarla cada vez
    }
  }

  static marcarVista(): void {
    try {
      localStorage.setItem(AyudaSugerenciasProductosComponent.CLAVE_VISTA, '1');
    } catch {
      // sin almacenamiento no pasa nada: el botón sigue ahí
    }
  }
}
