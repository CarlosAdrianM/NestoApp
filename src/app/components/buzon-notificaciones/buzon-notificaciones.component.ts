import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import {
  BuzonNotificacionesService, NotificacionBuzon, nuevasNotificaciones, puedeHaberMas, siguientePagina
} from 'src/app/services/buzon-notificaciones.service';
import { rutaDeNotificacion } from 'src/app/utils/notificaciones';

/**
 * NestoApp#176 / NestoAPI#387 (gemela de TiendasNuevaVision#36): el buzón de avisos. Una push que
 * se descarta o llega con el móvil en silencio ya no se pierde: aquí están todas. Tocar un aviso lo
 * marca como leído y lleva al mismo sitio que la push (p. ej. la respuesta en Novedades, #193).
 */
@Component({
  selector: 'app-buzon-notificaciones',
  templateUrl: './buzon-notificaciones.component.html',
  styleUrls: ['./buzon-notificaciones.component.scss'],
  standalone: false
})
export class BuzonNotificacionesComponent {

  public notificaciones: NotificacionBuzon[] = [];
  public cargando: boolean = false;
  /** Sin red o el servidor no contesta: se dice, sin fingir que el buzón está vacío. */
  public cargaFallida: boolean = false;
  public hayMas: boolean = false;

  constructor(
    private servicio: BuzonNotificacionesService,
    private router: Router,
    private toastCtrl: ToastController
  ) { }

  get sinNotificaciones(): boolean {
    return !this.cargando && !this.cargaFallida && this.notificaciones.length === 0;
  }

  get hayNoLeidas(): boolean {
    return this.notificaciones.some(n => !n.Leida);
  }

  ionViewWillEnter(): void {
    this.cargar(null);
  }

  /** La primera página, desde cero: al entrar y al arrastrar para refrescar. */
  public cargar(evento: any): void {
    this.cargando = true;
    this.cargaFallida = false;
    this.servicio.leer(1).subscribe({
      next: pagina => {
        this.notificaciones = pagina;
        this.hayMas = puedeHaberMas(pagina.length);
        this.cargando = false;
        evento?.target?.complete();
      },
      error: error => {
        console.error('No se han podido cargar los avisos', error);
        this.cargaFallida = this.notificaciones.length === 0;
        this.cargando = false;
        evento?.target?.complete();
      }
    });
    // Lo que se ve y lo que dice el menú tienen que cuadrar
    this.servicio.refrescarContador();
  }

  /** Scroll infinito: la página siguiente, si puede haberla. */
  public cargarMas(evento: any): void {
    if (!this.hayMas || this.cargando) {
      evento?.target?.complete();
      return;
    }
    this.servicio.leer(siguientePagina(this.notificaciones.length)).subscribe({
      next: pagina => {
        this.notificaciones = [...this.notificaciones, ...nuevasNotificaciones(this.notificaciones, pagina)];
        this.hayMas = puedeHaberMas(pagina.length);
        evento?.target?.complete();
      },
      error: error => {
        // Sin avisos al hacer scroll: la lista que ya tiene sigue ahí y se reintenta al volver al final
        console.error('No se ha podido cargar la página siguiente de avisos', error);
        evento?.target?.complete();
      }
    });
  }

  public abrir(notificacion: NotificacionBuzon): void {
    if (!notificacion.Leida) {
      notificacion.Leida = true; // optimista
      this.servicio.marcarLeida(notificacion.Id).subscribe({
        error: error => {
          console.error('No se ha podido marcar el aviso como leído', error);
          notificacion.Leida = false;
        }
      });
    }
    const ruta = rutaDeNotificacion(notificacion.Datos);
    if (ruta) {
      this.router.navigateByUrl(ruta);
    }
  }

  public marcarTodasLeidas(): void {
    const antes = this.notificaciones.map(n => n.Leida);
    this.notificaciones.forEach(n => n.Leida = true);
    this.servicio.marcarTodasLeidas().subscribe({
      error: async error => {
        console.error('No se han podido marcar los avisos como leídos', error);
        this.notificaciones.forEach((n, i) => n.Leida = antes[i]);
        await this.avisar('No se han podido marcar los avisos como leídos.');
      }
    });
  }

  public eliminar(notificacion: NotificacionBuzon, deslizable?: any): void {
    deslizable?.close?.();
    const posicion = this.notificaciones.indexOf(notificacion);
    this.notificaciones = this.notificaciones.filter(n => n !== notificacion); // optimista
    this.servicio.eliminar(notificacion.Id, !notificacion.Leida).subscribe({
      error: async error => {
        console.error('No se ha podido borrar el aviso', error);
        const lista = [...this.notificaciones];
        lista.splice(Math.max(0, posicion), 0, notificacion);
        this.notificaciones = lista;
        await this.avisar('No se ha podido borrar el aviso.');
      }
    });
  }

  public idNotificacion(_indice: number, notificacion: NotificacionBuzon): number {
    return notificacion.Id;
  }

  private async avisar(mensaje: string): Promise<void> {
    const toast = await this.toastCtrl.create({ message: mensaje, duration: 2500, color: 'warning' });
    await toast.present();
  }
}
