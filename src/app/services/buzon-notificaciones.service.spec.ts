import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import {
  BuzonNotificacionesService, NotificacionBuzon, nuevasNotificaciones, puedeHaberMas, siguientePagina, textoContador
} from './buzon-notificaciones.service';

/** NestoApp#176 / NestoAPI#387: el buzón de avisos de la app (réplica de TiendasNuevaVision#36). */
describe('BuzonNotificacionesService (#176)', () => {
  let servicio: BuzonNotificacionesService;
  let http: HttpTestingController;
  let contador: number;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    });
    servicio = TestBed.inject(BuzonNotificacionesService);
    http = TestBed.inject(HttpTestingController);
    servicio.noLeidas$.subscribe(n => contador = n);
  });

  afterEach(() => http.verify());

  it('pide la página del buzón de NestoApp', () => {
    servicio.leer(2).subscribe();

    const req = http.expectOne(r => r.url.endsWith('/Notificaciones/Buzon'));
    expect(req.request.params.get('aplicacion')).toBe('NestoApp');
    expect(req.request.params.get('pagina')).toBe('2');
    expect(req.request.params.get('tamanoPagina')).toBe('20');
    expect(req.request.params.get('soloNoLeidas')).toBe('false');
    req.flush(null);
  });

  it('el contador sale de NoLeidas; si falla se queda con lo último que sabía', () => {
    servicio.refrescarContador();
    http.expectOne(r => r.url.endsWith('/Notificaciones/Buzon/NoLeidas')).flush(3);
    expect(contador).toBe(3);

    servicio.refrescarContador();
    http.expectOne(r => r.url.endsWith('/Notificaciones/Buzon/NoLeidas')).flush('x', { status: 401, statusText: 'Unauthorized' });
    expect(contador).toBe(3);
  });

  it('marcar leída, marcar todas y borrar ajustan el contador', () => {
    servicio.refrescarContador();
    http.expectOne(r => r.url.endsWith('/NoLeidas')).flush(3);

    servicio.marcarLeida(7).subscribe();
    const put = http.expectOne(r => r.url.endsWith('/Notificaciones/Buzon/7/Leida'));
    expect(put.request.method).toBe('PUT');
    put.flush(null);
    expect(contador).toBe(2);

    servicio.eliminar(8, true).subscribe();
    const del = http.expectOne(r => r.url.endsWith('/Notificaciones/Buzon/8'));
    expect(del.request.method).toBe('DELETE');
    del.flush(null);
    expect(contador).toBe(1);

    servicio.eliminar(9, false).subscribe(); // ya leída: no cuenta
    http.expectOne(r => r.url.endsWith('/Notificaciones/Buzon/9')).flush(null);
    expect(contador).toBe(1);

    servicio.marcarTodasLeidas().subscribe();
    const todas = http.expectOne(r => r.url.endsWith('/Notificaciones/Buzon/Leidas'));
    expect(todas.request.params.get('aplicacion')).toBe('NestoApp');
    todas.flush(1);
    expect(contador).toBe(0);
  });

  it('al cerrar sesión el contador vuelve a 0', () => {
    servicio.refrescarContador();
    http.expectOne(r => r.url.endsWith('/NoLeidas')).flush(5);

    servicio.reiniciar();

    expect(contador).toBe(0);
  });
});

describe('Paginación del buzón (#176)', () => {
  const aviso = (Id: number): NotificacionBuzon => ({ Id, Titulo: 't', Cuerpo: 'c', Datos: null, FechaCreacion: '2026-09-24', Leida: false });

  it('la página siguiente sale de lo que hay cargado (si se borra una, se vuelve a pedir la misma)', () => {
    expect(siguientePagina(20)).toBe(2);
    expect(siguientePagina(19)).toBe(1);
    expect(siguientePagina(0)).toBe(1);
  });

  it('puede haber más si la última vino llena', () => {
    expect(puedeHaberMas(20)).toBeTrue();
    expect(puedeHaberMas(7)).toBeFalse();
  });

  it('las repetidas (entró una nueva arriba) se descartan por Id', () => {
    expect(nuevasNotificaciones([aviso(1), aviso(2)], [aviso(2), aviso(3)]).map(n => n.Id)).toEqual([3]);
  });

  it('el contador no pasa de 99+', () => {
    expect(textoContador(0)).toBe('');
    expect(textoContador(5)).toBe('5');
    expect(textoContador(120)).toBe('99+');
  });
});
