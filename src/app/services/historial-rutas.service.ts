import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

/**
 * NestoApp#203 / NestoAPI#558: recuerda por qué pantallas ha ido pasando el usuario para que, al
 * avisar de que algo no funciona desde las Novedades, la API sepa en qué pantalla estaba antes.
 * Se instancia en AppComponent para que empiece a escuchar desde el arranque.
 */
@Injectable({
  providedIn: 'root'
})
export class HistorialRutasService {
  private static readonly MAXIMO_PANTALLA = 100;
  private pantallas: string[] = [];

  constructor(router: Router) {
    router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: NavigationEnd) => {
      const pantalla = (e.urlAfterRedirects || e.url || '').split('?')[0].split('#')[0];
      if (pantalla && pantalla !== this.pantallas[this.pantallas.length - 1]) {
        this.pantallas = [...this.pantallas, pantalla].slice(-2);
      }
    });
  }

  /** La pantalla en la que se estaba antes de la actual, o null si no hay. */
  public pantallaAnterior(): string | null {
    return this.pantallas.length < 2 ? null : this.pantallas[0].substring(0, HistorialRutasService.MAXIMO_PANTALLA);
  }
}
