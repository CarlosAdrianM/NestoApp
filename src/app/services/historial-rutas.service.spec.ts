import { Subject } from 'rxjs';
import { NavigationEnd } from '@angular/router';
import { HistorialRutasService } from './historial-rutas.service';

/** NestoApp#203: al avisar de un fallo desde Novedades, la pantalla de la que se venía. */
describe('HistorialRutasService (#203)', () => {
  let eventos: Subject<any>;
  let servicio: HistorialRutasService;

  beforeEach(() => {
    eventos = new Subject<any>();
    servicio = new HistorialRutasService({ events: eventos } as any);
  });

  const navegar = (url: string) => eventos.next(new NavigationEnd(1, url, url));

  it('la pantalla anterior es la última distinta de la de ahora, sin parámetros', () => {
    navegar('/pedido-venta?empresa=1&numero=922500');
    navegar('/profile');
    expect(servicio.pantallaAnterior()).toBe('/pedido-venta');
  });

  it('cambiar solo los parámetros de la misma pantalla no cuenta', () => {
    navegar('/plantilla-venta');
    navegar('/profile?novedad=1');
    navegar('/profile?novedad=2');
    expect(servicio.pantallaAnterior()).toBe('/plantilla-venta');
  });

  it('sin historia, nada', () => {
    expect(servicio.pantallaAnterior()).toBeNull();
    navegar('/profile');
    expect(servicio.pantallaAnterior()).toBeNull();
  });

  it('nunca más de 100 caracteres', () => {
    navegar('/' + 'x'.repeat(150));
    navegar('/profile');
    expect(servicio.pantallaAnterior()!.length).toBe(100);
  });
});
