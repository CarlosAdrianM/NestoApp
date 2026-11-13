import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { PagoAPlazosService } from './pago-a-plazos.service';
import { EnvioWhatsAppService } from './envio-whatsapp.service';
import { FirebaseAnalytics } from './firebase-analytics.service';

describe('PagoAPlazosService (#281, NestoAPI#864)', () => {
  let servicio: PagoAPlazosService;
  let http: HttpTestingController;
  let alertas: any[];
  let toasts: any[];
  let whatsApp: any;

  const disponible = (extra: any = {}) => ({
    Disponible: true, Motivo: null, Proveedor: 'Aplazame', NombreProveedor: 'Aplázame', Importe: 300, ImporteMinimo: 60, ImporteMaximo: 3000,
    DiasPlazoCaptura: 14, ClienteTieneApp: false, Canal: 'Enlace', Aviso: null, InvitacionApp: null, Pruebas: false, ...extra
  });
  const ultimaAlerta = () => alertas[alertas.length - 1];
  const pulsar = (texto: string) => ultimaAlerta().buttons.find((b: any) => b.text === texto).handler?.();
  const urlPlazos = (r: any) => r.url.endsWith('/PedidosVenta/1/905123/PagoAPlazos');

  beforeEach(() => {
    alertas = [];
    toasts = [];
    whatsApp = { enviarTexto: jasmine.createSpy('enviarTexto') };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting(),
        { provide: AlertController, useValue: { create: (o: any) => { alertas.push(o); return Promise.resolve({ present: () => Promise.resolve() }); } } },
        { provide: LoadingController, useValue: { create: () => Promise.resolve({ present: () => Promise.resolve(), dismiss: () => Promise.resolve() }) } },
        { provide: ToastController, useValue: { create: (o: any) => { toasts.push(o); return Promise.resolve({ present: () => Promise.resolve() }); } } },
        { provide: EnvioWhatsAppService, useValue: whatsApp },
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } }
      ]
    });
    servicio = TestBed.inject(PagoAPlazosService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('disponible: si la API falla (503), null', () => {
    let resultado: any = 'sin contestar';
    servicio.disponible('1', 905123).subscribe(r => resultado = r);
    http.expectOne(r => r.url.endsWith('/PedidosVenta/1/905123/PagoAPlazos/Disponible')).flush({ Message: 'x' }, { status: 503, statusText: 'x' });
    expect(resultado).toBeNull();
  });

  it('cliente sin app: pide el enlace y deja mandarlo por WhatsApp (el mensaje completo de la API)', fakeAsync(() => {
    const hecho = servicio.ofrecer('1', 905123, disponible({ Aviso: 'El cliente no tiene la app.' }) as any);
    flushMicrotasks();
    expect(ultimaAlerta().header).toBe('Pagar a plazos con Aplázame');
    expect(ultimaAlerta().message).toContain('El cliente no tiene la app.');
    expect(ultimaAlerta().buttons.map((b: any) => b.text)).toEqual(['Cancelar', 'Pedir el enlace']);
    pulsar('Pedir el enlace');
    flushMicrotasks();

    const req = http.expectOne(urlPlazos);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ Canal: 'Enlace', Correo: null });
    req.flush({ HaySolicitud: true, Estado: 'Pendiente', UrlPago: 'https://pago', MensajeCliente: 'Hola: https://pago', InvitacionApp: 'Instale la app' });
    flushMicrotasks();

    expect(ultimaAlerta().header).toBe('Enlace de Aplázame');
    expect(ultimaAlerta().buttons.map((b: any) => b.text)).toEqual(['WhatsApp', 'Copiar', 'Copiar invitación a la app', 'Cerrar']);
    pulsar('WhatsApp');
    expect(whatsApp.enviarTexto).toHaveBeenCalledWith('Hola: https://pago');
    let resultado: boolean;
    hecho.then(r => resultado = r);
    flushMicrotasks();
    expect(resultado).toBeTrue();
  }));

  it('cliente con app: «Avisar en su app» y, si llega, solo un toast', fakeAsync(() => {
    servicio.ofrecer('1', 905123, disponible({ ClienteTieneApp: true, Canal: 'App' }) as any);
    flushMicrotasks();
    expect(ultimaAlerta().buttons.map((b: any) => b.text)).toEqual(['Cancelar', 'Mandar enlace', 'Avisar en su app']);
    pulsar('Avisar en su app');
    flushMicrotasks();
    const req = http.expectOne(urlPlazos);
    expect(req.request.body.Canal).toBe('App');
    req.flush({ HaySolicitud: true, Estado: 'Pendiente', DispositivosAvisados: 1, UrlPago: null, MensajeCliente: null });
    flushMicrotasks();
    expect(toasts[toasts.length - 1].message).toContain('aviso a su app');
  }));

  it('no disponible: dice el motivo y no pide nada', fakeAsync(() => {
    servicio.ofrecer('1', 905123, disponible({ Disponible: false, Motivo: 'El importe es menor que el mínimo.' }) as any);
    flushMicrotasks();
    expect(ultimaAlerta().message).toBe('El importe es menor que el mínimo.');
  }));

  it('si la API dice que no (409), enseña su mensaje', fakeAsync(() => {
    servicio.ofrecer('1', 905123, disponible() as any);
    flushMicrotasks();
    pulsar('Pedir el enlace');
    flushMicrotasks();
    http.expectOne(urlPlazos).flush({ Message: 'El pedido ya está pagado.' }, { status: 409, statusText: 'Conflict' });
    flushMicrotasks();
    expect(ultimaAlerta().header).toBe('No se ha podido pedir el pago a plazos');
  }));

  it('cancelar: pide confirmación y manda el DELETE', fakeAsync(() => {
    servicio.preguntarCancelar('1', 905123, 'Aplázame');
    flushMicrotasks();
    pulsar('Cancelar la solicitud');
    flushMicrotasks();
    const req = http.expectOne(urlPlazos);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
    flushMicrotasks();
  }));
});
