import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AutorizacionesPedidoService } from './autorizaciones-pedido.service';

describe('AutorizacionesPedidoService (#280, #290; Novedades 1258)', () => {
  let servicio: AutorizacionesPedidoService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()] });
    servicio = TestBed.inject(AutorizacionesPedidoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('pedir: manda el pedido tal cual y el comentario limpio (vacío = null)', () => {
    const pedido = { empresa: '1', cliente: '15191', Lineas: [{ producto: '45929' }] };
    servicio.pedir(pedido, '  lo hablé con el cliente ').subscribe(r => expect(r.Destinatarios).toEqual(['Ana']));
    const req = http.expectOne(r => r.url.endsWith('/PedidosVenta/Autorizaciones'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ Pedido: pedido, Comentario: 'lo hablé con el cliente' });
    req.flush({ Id: 12, Estado: 'Pendiente', Destinatarios: ['Ana'] });

    servicio.pedir(pedido, '  ').subscribe();
    const req2 = http.expectOne(r => r.url.endsWith('/PedidosVenta/Autorizaciones'));
    expect(req2.request.body.Comentario).toBeNull();
    req2.flush({ Id: 13, Estado: 'Pendiente' });
  });

  it('leer: pendientes y mías viajan como parámetros', () => {
    servicio.leer(true, false).subscribe(lista => expect(lista).toEqual([]));
    const req = http.expectOne(r => r.url.endsWith('/PedidosVenta/Autorizaciones'));
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('pendientes')).toBe('true');
    expect(req.request.params.get('mias')).toBe('false');
    req.flush(null);
  });

  it('leerUna, autorizar, denegar y anular van a su ruta', () => {
    servicio.leerUna(12).subscribe();
    http.expectOne(r => r.method === 'GET' && r.url.endsWith('/PedidosVenta/Autorizaciones/12')).flush({ Id: 12 });

    servicio.autorizar(12, ' ').subscribe(r => expect(r.Pedido).toBe(931500));
    const autorizar = http.expectOne(r => r.url.endsWith('/PedidosVenta/Autorizaciones/12/Autorizar'));
    expect(autorizar.request.method).toBe('POST');
    expect(autorizar.request.body).toEqual({ Comentario: null });
    autorizar.flush({ Id: 12, Estado: 'Autorizada', Pedido: 931500 });

    servicio.denegar(12, ' no toca ').subscribe();
    const denegar = http.expectOne(r => r.url.endsWith('/PedidosVenta/Autorizaciones/12/Denegar'));
    expect(denegar.request.body).toEqual({ Motivo: 'no toca' });
    denegar.flush({ Id: 12, Estado: 'Denegada' });

    servicio.anular(12).subscribe();
    const anular = http.expectOne(r => r.url.endsWith('/PedidosVenta/Autorizaciones/12'));
    expect(anular.request.method).toBe('DELETE');
    anular.flush({ Id: 12, Estado: 'Anulada' });
  });
});
