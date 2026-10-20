import { fakeAsync, tick } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { DatosSugerenciasProductos, EstadoSugerenciasProductos } from './estado-sugerencias-productos';

describe('EstadoSugerenciasProductos (#235)', () => {
  let servicio: any;
  let datos: DatosSugerenciasProductos | null;
  let estado: EstadoSugerenciasProductos;
  const sugerencia = (Producto: string, Posicion: number): any => ({ IdSugerencia: Posicion * 10, Producto, Posicion, Nombre: Producto, Motivo: 'LeToca', Texto: '' });

  beforeEach(() => {
    datos = { empresa: '1', cliente: '15191', contacto: '0', vendedor: 'NV', lineas: [{ producto: '38000', cantidad: 1, cantidadOferta: 0 }] };
    servicio = {
      calcular: jasmine.createSpy('calcular').and.returnValue(of({ IdSesion: 'sesion-1', Sugerencias: [sugerencia('A', 1), sugerencia('B', 2), sugerencia('C', 3)] })),
      responder: jasmine.createSpy('responder').and.returnValue(of({ IdSugerencia: 10, Respuesta: 'NoLeInteresa', Sustituta: sugerencia('D', 1) }))
    };
    estado = new EstadoSugerenciasProductos(servicio, () => datos);
  });

  it('pregunta con retardo, una sola vez aunque se programe varias, y guarda la sesión', fakeAsync(() => {
    estado.programar();
    estado.programar();
    tick(999);
    expect(servicio.calcular).not.toHaveBeenCalled();
    tick(1);

    expect(servicio.calcular).toHaveBeenCalledTimes(1);
    const peticion = servicio.calcular.calls.mostRecent().args[0];
    expect(peticion.Aplicacion).toBe('NestoApp');
    expect(peticion.IdSesion).toBeNull();
    expect(peticion.Productos).toEqual([{ Producto: '38000', Cantidad: 1 }]);
    expect(estado.idSesion).toBe('sesion-1');
    expect(estado.sugerencias.length).toBe(3);
  }));

  it('cambiar una cantidad no vuelve a preguntar; añadir un producto sí, con la misma sesión', () => {
    estado.calcularYa();
    datos.lineas = [{ producto: '38000', cantidad: 5 }];
    estado.calcularYa();
    expect(servicio.calcular).toHaveBeenCalledTimes(1);

    datos.lineas = [{ producto: '38000', cantidad: 5 }, { producto: 'A', cantidad: 1 }];
    estado.calcularYa();
    expect(servicio.calcular).toHaveBeenCalledTimes(2);
    expect(servicio.calcular.calls.mostRecent().args[0].IdSesion).toBe('sesion-1');
  });

  it('otro cliente empieza sesión nueva', () => {
    estado.calcularYa();
    datos = { ...datos, cliente: '20000' };
    estado.calcularYa();
    expect(servicio.calcular.calls.mostRecent().args[0].IdSesion).toBeNull();
  });

  it('si la API falla no hay sugerencias (y no hay botón)', () => {
    servicio.calcular.and.returnValue(of(null));
    estado.calcularYa();
    expect(estado.sugerencias).toEqual([]);
  });

  it('una respuesta que llega tarde de otro cliente se descarta', () => {
    const lenta = new Subject<any>();
    servicio.calcular.and.returnValues(lenta, of({ IdSesion: 's2', Sugerencias: [sugerencia('Z', 1)] }));
    estado.calcularYa();
    datos = { ...datos, cliente: '20000' };
    estado.calcularYa();
    lenta.next({ IdSesion: 's1', Sugerencias: [sugerencia('A', 1)] });

    expect(estado.sugerencias.map(s => s.Producto)).toEqual(['Z']);
    expect(estado.idSesion).toBe('s2');
  });

  it('«No le interesa» quita la tarjeta y pone la sustituta en su hueco', fakeAsync(() => {
    estado.calcularYa();
    estado.responder(estado.sugerencias[0], 'NoLeInteresa');
    tick();

    expect(servicio.responder).toHaveBeenCalledWith(10, 'NoLeInteresa', [{ Producto: '38000', Cantidad: 1 }]);
    expect(estado.sugerencias.map(s => s.Producto)).toEqual(['D', 'B', 'C']);
  }));

  it('«Añadir» quita la tarjeta y no pone sustituta', fakeAsync(() => {
    estado.calcularYa();
    estado.responder(estado.sugerencias[1], 'Anadido');
    tick();

    expect(estado.sugerencias.map(s => s.Producto)).toEqual(['A', 'C']);
  }));
});
