import { Subject, of, throwError } from 'rxjs';
import { EnvioDevueltoComponent } from './envio-devuelto.component';

/** NestoApp#267 (NestoAPI#699, corte 2): ¿el cliente sigue queriendo el envío devuelto? */
describe('EnvioDevueltoComponent (#267)', () => {
  let componente: EnvioDevueltoComponent;
  let servicio: any;
  let params: Subject<any>;
  let alertas: any[];
  let nav: any;

  const envio = (cambios: any = {}) => ({
    Numero: 123, Empresa: '1', Cliente: '15191', Contacto: '0', Pedido: 929498, Estado: 4, Fecha: '2026-11-03T00:00:00', Nombre: 'PELUQUERÍA X',
    Direccion: 'CALLE MAYOR, 5', CodPostal: '28013', Poblacion: 'MADRID', Provincia: 'MADRID', Telefono: '910000000', Movil: '600111222',
    DetalleEstado: 'Ausente en reparto', Decision: 'SinDecidir', ...cambios
  });
  const alertCtrl = () => ({ create: (o: any) => { alertas.push(o); return Promise.resolve({ present: () => Promise.resolve(), onDidDismiss: () => Promise.resolve({}) }); } });
  const loadingCtrl = { create: () => Promise.resolve({ present: () => Promise.resolve(), dismiss: () => Promise.resolve() }) };
  const pulsar = async (alerta: any, texto: string) => { const b = alerta.buttons.find((x: any) => x.text === texto); if (b?.handler) { await b.handler(); } };
  const esperar = () => new Promise(r => setTimeout(r, 0));

  beforeEach(() => {
    alertas = [];
    params = new Subject<any>();
    nav = { navigateForward: jasmine.createSpy('navigateForward') };
    servicio = {
      leerDevueltos: jasmine.createSpy('leerDevueltos').and.returnValue(of([envio(), envio({ Numero: 99, Decision: 'Abonar' })])),
      reenviar: jasmine.createSpy('reenviar').and.returnValue(of({ EnvioOrigen: 123, Pedido: 929498, Decision: 'Reenviar', EnvioNuevo: 124, Avisos: [] })),
      abonar: jasmine.createSpy('abonar').and.returnValue(of({ EnvioOrigen: 123, Decision: 'Abonar' }))
    };
    componente = new EnvioDevueltoComponent({ queryParams: params } as any, servicio, alertCtrl() as any, loadingCtrl as any, nav,
      { extractErrorMessage: (e: any) => e?.message || 'error' } as any, { logEvent: () => { } } as any);
  });

  it('carga el envío de la push y precarga la dirección y los teléfonos para corregirlos', () => {
    params.next({ empresa: '1', envio: '123', aviso: '1' });

    expect(servicio.leerDevueltos).toHaveBeenCalledWith('1');
    expect(componente.envio.Numero).toBe(123);
    expect(componente.decidido).toBeFalse();
    expect(componente.datos.Direccion).toBe('CALLE MAYOR, 5');
    expect(componente.datos.Movil).toBe('600111222');
    expect(componente.datos.IncluirPortes).toBeFalse(); // Carlos: los portes nos los comemos por defecto
  });

  it('si ya está decidido, lo dice y no hay botones', () => {
    params.next({ envio: '99' });
    expect(componente.decidido).toBeTrue();
    expect(componente.textoDecision).toContain('abonarlo');
  });

  it('si no está entre los devueltos de los últimos 60 días, lo dice', () => {
    params.next({ envio: '555' });
    expect(componente.envio).toBeNull();
    expect(componente.mensaje).toContain('555');
  });

  it('«Sí, volver a enviar» manda la dirección corregida, sin portes salvo que se marquen, y recarga', async () => {
    params.next({ envio: '123' });
    componente.datos.Direccion = ' CALLE NUEVA, 7 ';
    componente.datos.Observaciones = '';

    await componente.reenviar();
    await esperar();

    expect(servicio.reenviar).toHaveBeenCalledWith(123, { Direccion: 'CALLE NUEVA, 7', CodPostal: '28013', Poblacion: 'MADRID', Provincia: 'MADRID', Telefono: '910000000', Movil: '600111222', IncluirPortes: false });
    expect(alertas[0].header).toBe('Se vuelve a enviar');
    expect(alertas[0].message).toContain('envío nuevo 124');
    expect(servicio.leerDevueltos).toHaveBeenCalledTimes(2);
  });

  it('sin dirección o código postal no se manda nada', async () => {
    params.next({ envio: '123' });
    componente.datos.CodPostal = '';
    await componente.reenviar();
    expect(servicio.reenviar).not.toHaveBeenCalled();
    expect(alertas[0].header).toBe('Faltan datos');
  });

  it('«No, abonar» pide confirmación y anota la decisión', async () => {
    params.next({ envio: '123' });
    await componente.abonar();
    expect(alertas[0].header).toBe('¿Abonar el pedido?');
    await pulsar(alertas[0], 'Sí, abonar');
    await esperar();
    expect(servicio.abonar).toHaveBeenCalledWith(123);
    expect(alertas[1].header).toBe('Se abona');
  });

  it('un 409 (ya decidido en Nesto) enseña el mensaje de la API y recarga', async () => {
    params.next({ envio: '123' });
    servicio.reenviar.and.returnValue(throwError(() => ({ status: 409, message: 'El envío 123 ya está decidido: Reenviar (Marta, 04/11/2026).' })));

    await componente.reenviar();
    await esperar();

    expect(alertas[0].header).toBe('Este envío ya está decidido');
    expect(alertas[0].message).toContain('Marta');
    expect(servicio.leerDevueltos).toHaveBeenCalledTimes(2);
  });

  it('con una API anterior (404) lo dice', () => {
    servicio.leerDevueltos.and.returnValue(throwError(() => ({ status: 404 })));
    params.next({ envio: '123' });
    expect(componente.mensaje).toContain('todavía no están disponibles');
  });

  it('el pedido se abre desde la ficha', () => {
    params.next({ envio: '123' });
    componente.abrirPedido();
    expect(nav.navigateForward).toHaveBeenCalledWith('pedido-venta', { queryParams: { empresa: '1', numero: 929498 } });
  });
});
