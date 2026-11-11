import { of, throwError } from 'rxjs';
import { PedidosEnRiesgoComponent } from './pedidos-en-riesgo.component';

/** NestoApp#248 (NestoAPI#693): la lista de pedidos con la fecha prometida en riesgo del vendedor. */
describe('PedidosEnRiesgoComponent (#248)', () => {
  let componente: PedidosEnRiesgoComponent;
  let servicio: any;
  let nav: any;
  let alertas: any[];
  const pedido = (cambios: any = {}) => ({
    Id: 1, Empresa: '1', Pedido: 929498, Cliente: '15191', Contacto: '0', NombreCliente: 'PELUQUERÍA ANA', FechaPrometida: '2026-10-22T00:00:00',
    FechaNueva: '2026-10-30T00:00:00', DiasRetraso: 8, Motivo: 'El producto 38093 no llega hasta el 30/10.', ...cambios
  });
  const avisos = (valor: string) => ({ Valor: valor, Texto: valor, Opciones: [{ Valor: 'Todo', Texto: 'Campana y correo resumen' }, { Valor: 'Nada', Texto: 'Nada (solo la ventana)' }] });
  const esperar = () => new Promise(r => setTimeout(r, 0));

  beforeEach(() => {
    alertas = [];
    nav = { navigateForward: jasmine.createSpy('navigateForward') };
    servicio = {
      leer: jasmine.createSpy('leer').and.returnValue(of([pedido(), pedido({ Id: 2, Pedido: 929500, FechaNueva: null })])),
      leerAvisos: jasmine.createSpy('leerAvisos').and.returnValue(of(avisos('Todo'))),
      guardarAvisos: jasmine.createSpy('guardarAvisos').and.returnValue(of(avisos('Nada')))
    };
    componente = new PedidosEnRiesgoComponent(servicio, nav,
      { create: (o: any) => { alertas.push(o); return Promise.resolve({ present: () => Promise.resolve() }); } } as any,
      { extractErrorMessage: (e: any) => e?.message || 'error' } as any, { logEvent: () => { } } as any);
  });

  it('al entrar carga los que siguen en riesgo (sin los resueltos) y los avisos del usuario', () => {
    componente.ionViewWillEnter();

    expect(servicio.leer).toHaveBeenCalledWith(false);
    expect(componente.pedidos.length).toBe(2);
    expect(componente.pendientes).toBe(2);
    expect(componente.avisos.Valor).toBe('Todo');
    expect(componente.cargando).toBeFalse();
  });

  it('«Ver también los resueltos» vuelve a pedir la lista con ellos', () => {
    componente.cambiarVerResueltos(true);
    expect(servicio.leer).toHaveBeenCalledWith(true);
  });

  it('al tocar uno se abre el pedido', () => {
    componente.abrir(pedido() as any);
    expect(nav.navigateForward).toHaveBeenCalledWith('pedido-venta', { queryParams: { empresa: '1', numero: 929498 } });
  });

  it('con una API anterior (404) o sin permiso (403) lo dice', () => {
    servicio.leer.and.returnValue(throwError(() => ({ status: 404 })));
    componente.cargar();
    expect(componente.mensaje).toContain('todavía no están disponibles');

    servicio.leer.and.returnValue(throwError(() => ({ statusCode: 403 })));
    componente.cargar();
    expect(componente.mensaje).toContain('No tiene permiso');
    expect(componente.pedidos).toEqual([]);
  });

  it('si la API no da los avisos, no hay selector', () => {
    servicio.leerAvisos.and.returnValue(throwError(() => ({ status: 404 })));
    componente.cargarAvisos();
    expect(componente.avisos).toBeNull();
  });

  it('cambiar los avisos los guarda; el mismo valor no hace nada', () => {
    componente.cargarAvisos();
    componente.cambiarAvisos('Todo');
    expect(servicio.guardarAvisos).not.toHaveBeenCalled();

    componente.cambiarAvisos('Nada');
    expect(servicio.guardarAvisos).toHaveBeenCalledWith('Nada');
    expect(componente.avisos.Valor).toBe('Nada');
    expect(componente.guardandoAvisos).toBeFalse();
  });

  it('si no se pueden guardar, se dice y se queda lo que había', async () => {
    componente.cargarAvisos();
    servicio.guardarAvisos.and.returnValue(throwError(() => ({ message: 'El valor tiene que ser uno de: Todo, SoloCorreo, SoloCampana, Nada.' })));

    componente.cambiarAvisos('Nada');
    await esperar();

    expect(componente.avisos.Valor).toBe('Todo');
    expect(alertas[0].header).toBe('No se ha podido guardar');
    expect(alertas[0].message).toContain('El valor tiene que ser');
  });
});
