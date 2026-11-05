import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ActionSheetController, AlertController, LoadingController } from '@ionic/angular';
import { EnvioWhatsAppService } from './envio-whatsapp.service';
import { ErrorHandlerService } from './error-handler.service';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';

/** NestoApp#261 (NestoAPI#737 / Nesto#570): el pedido o la factura por WhatsApp con enlace de descarga. */
describe('EnvioWhatsAppService (#261)', () => {
  let service: EnvioWhatsAppService;
  let httpMock: HttpTestingController;
  let alertas: any[];
  let hojas: any[];
  let abiertas: string[];

  const enlace = (moviles: string[]) => ({
    Url: 'https://api.nuevavision.es/d/abc', Caduca: '2026-12-05T00:00:00', Tipo: 'Pedido', Numero: '929498',
    Moviles: moviles, Texto: 'Buenos días. Le enviamos su pedido 929498: https://api.nuevavision.es/d/abc'
  });

  beforeEach(() => {
    alertas = []; hojas = []; abiertas = [];
    TestBed.configureTestingModule({
      providers: [
        { provide: LoadingController, useValue: { create: () => Promise.resolve({ present: () => Promise.resolve(), dismiss: () => Promise.resolve() }) } },
        { provide: AlertController, useValue: { create: (o: any) => { alertas.push(o); return Promise.resolve({ present: () => Promise.resolve(), onDidDismiss: () => Promise.resolve({}) }); } } },
        { provide: ActionSheetController, useValue: { create: (o: any) => { hojas.push(o); return Promise.resolve({ present: () => Promise.resolve() }); } } },
        { provide: ErrorHandlerService, useValue: { extractErrorMessage: (e: any) => e?.message || 'error' } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(EnvioWhatsAppService);
    service.abrir = url => { abiertas.push(url); };
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('pide el enlace a la API con Tipo, Empresa y Numero', fakeAsync(() => {
    service.enviarDocumento('Pedido', '1', 929498);
    tick();
    const req = httpMock.expectOne(Configuracion.API_URL + '/Documentos/EnlaceDescarga');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ Tipo: 'Pedido', Empresa: '1', Numero: '929498' });
    req.flush(enlace(['34600111222']));
    tick();
  }));

  it('con un móvil abre WhatsApp con ese número y el texto de la API', fakeAsync(() => {
    service.enviarDocumento('Factura', '1', 'NV2616199');
    tick();
    httpMock.expectOne(() => true).flush(enlace(['34600111222']));
    tick();

    expect(abiertas.length).toBe(1);
    expect(abiertas[0]).toBe('https://wa.me/34600111222?text=' + encodeURIComponent(enlace([]).Texto));
    expect(hojas.length).toBe(0);
  }));

  it('con varios móviles se elige uno', fakeAsync(() => {
    service.enviarDocumento('Pedido', '1', 929498);
    tick();
    httpMock.expectOne(() => true).flush(enlace(['34600111222', '34611222333']));
    tick();

    expect(hojas.length).toBe(1);
    expect(hojas[0].buttons.map((b: any) => b.text)).toEqual(['600 111 222', '611 222 333', 'Cancelar']);
    hojas[0].buttons[1].handler();
    tick();
    expect(abiertas[0]).toContain('wa.me/34611222333?');
  }));

  it('sin móvil avisa y abre WhatsApp sin número', fakeAsync(() => {
    service.enviarDocumento('Pedido', '1', 929498);
    tick();
    httpMock.expectOne(() => true).flush(enlace([]));
    tick();

    expect(alertas[0].header).toBe('Sin móvil');
    expect(abiertas[0]).toContain('wa.me/?text=');
  }));

  // NestoApp#69: varias facturas en un mensaje
  it('con varios documentos pide un enlace por cada uno y abre un solo mensaje con todos', fakeAsync(() => {
    service.enviarVariosDocumentos('Factura', '1', ['NV1', 'NV2']);
    tick();
    httpMock.expectOne(r => r.body.Numero === 'NV1').flush({ ...enlace(['34600111222']), Numero: 'NV1', Tipo: 'Factura', Url: 'https://x/d/1' });
    tick();
    httpMock.expectOne(r => r.body.Numero === 'NV2').flush({ ...enlace(['34600111222']), Numero: 'NV2', Tipo: 'Factura', Url: 'https://x/d/2' });
    tick();

    expect(abiertas.length).toBe(1);
    const texto = decodeURIComponent(abiertas[0].split('?text=')[1]);
    expect(abiertas[0]).toContain('wa.me/34600111222?');
    expect(texto).toContain('https://x/d/1');
    expect(texto).toContain('https://x/d/2');
    expect(texto).toContain('Factura NV2');
  }));

  it('si un enlace falla, se avisa y se mandan los demás', fakeAsync(() => {
    service.enviarVariosDocumentos('Factura', '1', ['NV1', 'NV2']);
    tick();
    httpMock.expectOne(r => r.body.Numero === 'NV1').flush({ Message: 'no existe' }, { status: 404, statusText: 'Not Found' });
    tick();
    httpMock.expectOne(r => r.body.Numero === 'NV2').flush({ ...enlace(['34600111222']), Numero: 'NV2', Tipo: 'Factura', Url: 'https://x/d/2' });
    tick();

    expect(alertas[0].header).toBe('Algunas no se pueden mandar');
    expect(alertas[0].message).toContain('NV1');
    expect(abiertas.length).toBe(1);
    // Con una sola factura que sí se pudo preparar, va el texto de la API de esa factura.
    expect(decodeURIComponent(abiertas[0])).toContain(enlace([]).Texto);
  }));

  it('con uno solo, el camino de siempre (texto de la API)', fakeAsync(() => {
    service.enviarVariosDocumentos('Factura', '1', ['NV1']);
    tick();
    httpMock.expectOne(() => true).flush(enlace(['34600111222']));
    tick();
    expect(abiertas[0]).toBe('https://wa.me/34600111222?text=' + encodeURIComponent(enlace([]).Texto));
  }));

  it('si la API falla, se enseña el motivo y no se abre nada', fakeAsync(() => {
    service.enviarDocumento('Pedido', '1', 929498);
    tick();
    httpMock.expectOne(() => true).flush({ Message: 'El pedido no existe' }, { status: 404, statusText: 'Not Found' });
    tick();

    expect(alertas[0].header).toBe('No se ha podido preparar el enlace');
    expect(abiertas.length).toBe(0);
  }));
});
