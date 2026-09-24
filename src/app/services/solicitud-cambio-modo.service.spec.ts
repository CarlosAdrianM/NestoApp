import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { SolicitudCambioModoService } from './solicitud-cambio-modo.service';
import { ErrorHandlerService } from './error-handler.service';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';

/** NestoApp#191 / NestoAPI#533: con picking el modo no se cambia; se ofrece pedírselo a almacén. */
describe('SolicitudCambioModoService (#191)', () => {
  let servicio: SolicitudCambioModoService;
  let http: HttpTestingController;
  let alertas: any[];

  beforeEach(() => {
    alertas = [];
    const alertCtrl = {
      create: jasmine.createSpy('create').and.callFake(async (opciones: any) => {
        alertas.push(opciones);
        return { present: () => Promise.resolve() };
      })
    };
    TestBed.configureTestingModule({
      providers: [
        SolicitudCambioModoService,
        { provide: AlertController, useValue: alertCtrl },
        { provide: ErrorHandlerService, useValue: { extractErrorDetail: () => 'No se ha podido mandar el correo a almacén.' } },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    servicio = TestBed.inject(SolicitudCambioModoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  const MENSAJE_API = 'Este pedido ya está en preparación (tiene picking). Si hace falta, se lo podemos pedir a almacén: lo intentarán, pero puede que ya no llegue a tiempo.';

  it('enseña el motivo de la API y ofrece pedírselo a almacén, con comentario opcional', async () => {
    await servicio.ofrecer(MENSAJE_API, '1', 926879, 1);

    const alerta = alertas[0];
    expect(alerta.message).toBe(MENSAJE_API);
    expect(alerta.inputs[0].name).toBe('comentario');
    expect(alerta.buttons.map((b: any) => b.text)).toEqual(['Cancelar', 'Pedir el cambio a almacén']);
  });

  it('pedírselo a almacén manda la solicitud y enseña la respuesta, sin prometer nada', async () => {
    await servicio.ofrecer(MENSAJE_API, '1', 926879, 1);
    const pedir = alertas[0].buttons[1];

    pedir.handler({ comentario: '  El cliente lo quiere todo junto  ' });

    const peticion = http.expectOne(Configuracion.API_URL + '/PedidosVenta/SolicitudCambioModo');
    expect(peticion.request.method).toBe('POST');
    expect(peticion.request.body).toEqual({ Empresa: '1', Pedido: 926879, ModoDeseado: 1, Comentario: 'El cliente lo quiere todo junto' });
    peticion.flush('Se lo hemos pedido a almacén. Si todavía están a tiempo, lo cambiarán ellos.');
    await Promise.resolve();
    await Promise.resolve();

    expect(alertas[1].message).toBe('Se lo hemos pedido a almacén. Si todavía están a tiempo, lo cambiarán ellos.');
  });

  it('si no se puede mandar, se explica para que llame a almacén', async () => {
    await servicio.ofrecer(MENSAJE_API, '1', 926879, 1);

    alertas[0].buttons[1].handler({ comentario: '' });
    const peticion = http.expectOne(Configuracion.API_URL + '/PedidosVenta/SolicitudCambioModo');
    expect(peticion.request.body.Comentario).toBeNull();
    peticion.flush('No se ha podido mandar el correo a almacén.', { status: 400, statusText: 'Bad Request' });
    await Promise.resolve();
    await Promise.resolve();

    expect(alertas[1].header).toBe('No se ha podido pedir el cambio');
    expect(alertas[1].message).toContain('almacén');
  });

  it('cancelar no manda nada', async () => {
    await servicio.ofrecer(MENSAJE_API, '1', 926879, 1);

    expect(alertas[0].buttons[0].role).toBe('cancel');
    expect(alertas[0].buttons[0].handler).toBeUndefined();
  });
});
