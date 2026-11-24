import { Subject, of, throwError } from 'rxjs';
import { MiAlmacenComponent } from './mi-almacen.component';

/** NestoApp#292 (NestoAPI#894): «Mi almacén», lo que el vendedor tiene en su almacén ficticio. */
describe('MiAlmacenComponent (#292)', () => {
  let componente: MiAlmacenComponent;
  let servicio: any;
  let nav: any;

  const existencias = (almacen = 'IF') => ({
    Almacen: almacen, Descripcion: 'Israel Fernández',
    Productos: [
      { Producto: '45958', Nombre: 'CREMA HIDRATANTE', Familia: 'EVA', NombreFamilia: 'Eva Visnú', Unidades: 3 },
      { Producto: '99999', Nombre: 'CERA ROSETA', Familia: 'DEP', NombreFamilia: 'Depilación', Unidades: 2 }
    ],
    NumeroProductos: 2, TotalUnidades: 5
  });

  beforeEach(() => {
    nav = { navigateForward: jasmine.createSpy('navigateForward') };
    servicio = {
      leerAlmacenes: jasmine.createSpy('leerAlmacenes').and.returnValue(of([{ Codigo: 'IF', Descripcion: 'Israel Fernández', EsSuyo: true }])),
      leerExistencias: jasmine.createSpy('leerExistencias').and.callFake((codigo: string) => of(existencias(codigo)))
    };
    componente = new MiAlmacenComponent(servicio, nav, { extractErrorMessage: (e: any) => e?.message || 'error' } as any, { logEvent: () => { } } as any);
  });

  it('al entrar carga su almacén: productos por familia y el total arriba; sin selector si solo ve uno', () => {
    componente.ionViewWillEnter();

    expect(servicio.leerExistencias).toHaveBeenCalledWith('IF');
    expect(componente.variosAlmacenes).toBeFalse();
    expect(componente.grupos.map(g => g.nombre)).toEqual(['Depilación', 'Eva Visnú']);
    expect(componente.resumen).toBe('2 productos · 5 unidades');
    expect(componente.cargando).toBeFalse();
    expect(componente.mensaje).toBe('');
  });

  it('sin almacén asignado lo dice y no pide existencias', () => {
    servicio.leerAlmacenes.and.returnValue(of([]));
    componente.ionViewWillEnter();

    expect(componente.mensaje).toBe('No tiene almacén asignado.');
    expect(servicio.leerExistencias).not.toHaveBeenCalled();
    expect(componente.existencias).toBeNull();
  });

  it('el jefe de equipo ve varios: empieza por el suyo y puede cambiar', () => {
    servicio.leerAlmacenes.and.returnValue(of([{ Codigo: 'AB' }, { Codigo: 'IF', EsSuyo: true }]));
    componente.ionViewWillEnter();
    expect(componente.variosAlmacenes).toBeTrue();
    expect(componente.almacen).toBe('IF');

    componente.filtro = 'crema';
    componente.cambiarAlmacen('AB');
    expect(servicio.leerExistencias).toHaveBeenCalledWith('AB');
    expect(componente.existencias.Almacen).toBe('AB');
    expect(componente.filtro).toBe('');
  });

  it('al recargar se queda en el almacén que estaba viendo', () => {
    servicio.leerAlmacenes.and.returnValue(of([{ Codigo: 'AB' }, { Codigo: 'IF', EsSuyo: true }]));
    componente.ionViewWillEnter();
    componente.cambiarAlmacen('AB');
    servicio.leerExistencias.calls.reset();

    const evento = { target: { complete: jasmine.createSpy('complete') } };
    componente.cargar(evento);
    expect(servicio.leerExistencias).toHaveBeenCalledWith('AB');
    expect(evento.target.complete).toHaveBeenCalled();
  });

  it('el buscador filtra por nombre o referencia y dice lo que se está viendo', () => {
    componente.ionViewWillEnter();
    componente.filtro = 'cera';
    expect(componente.productosVisibles.map(p => p.Producto)).toEqual(['99999']);
    expect(componente.resumen).toBe('2 productos · 5 unidades');
    expect(componente.resumenFiltro).toBe('Con «cera»: 1 producto · 2 unidades');
  });

  it('un 403 o un 404 enseñan el mensaje de la API', () => {
    servicio.leerExistencias.and.returnValue(throwError(() => ({ status: 403, message: 'Ese almacén no es suyo ni de su equipo.' })));
    componente.ionViewWillEnter();
    expect(componente.mensaje).toBe('Ese almacén no es suyo ni de su equipo.');
    expect(componente.existencias).toBeNull();
    expect(componente.cargando).toBeFalse();
  });

  it('con una API anterior (404 al listar) lo dice', () => {
    servicio.leerAlmacenes.and.returnValue(throwError(() => ({ status: 404 })));
    componente.ionViewWillEnter();
    expect(componente.mensaje).toContain('todavía no está disponible');
  });

  it('descarta la respuesta de un almacén que ya no es el elegido', () => {
    servicio.leerAlmacenes.and.returnValue(of([{ Codigo: 'AB' }, { Codigo: 'IF', EsSuyo: true }]));
    const lenta = new Subject<any>();
    servicio.leerExistencias.and.callFake((codigo: string) => codigo === 'IF' ? lenta : of(existencias(codigo)));
    componente.ionViewWillEnter();
    componente.cambiarAlmacen('AB');
    lenta.next(existencias('IF'));
    expect(componente.existencias.Almacen).toBe('AB');
  });

  it('tocar un producto abre su ficha', () => {
    componente.abrirProducto({ Producto: ' 45958 ', Unidades: 3 });
    expect(nav.navigateForward).toHaveBeenCalledWith('producto', { queryParams: { empresa: '1', producto: '45958' } });
  });
});
