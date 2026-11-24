import {
  leerPedidoCambiado, leerPedidoEnPreparacion, mensajesAmpliacionEnPreparacion, pedidoNuevoDeLaAmpliacion
} from './guardado-pedido.model';

const error409 = (code: string, message: string, details: any = {}) =>
  ({ statusCode: 409, isBusinessError: true, apiError: { error: { code, message, details } } });

describe('Versión del pedido y 409 PEDIDO_CAMBIADO (#285)', () => {
  it('devuelve el mensaje de la API tal cual', () => {
    const mensaje = 'El pedido 929555 lo ha modificado Aida a las 15:14 desde que usted lo abrió. Recárguelo y vuelva a hacer los cambios.';
    expect(leerPedidoCambiado(error409('PEDIDO_CAMBIADO', mensaje))).toBe(mensaje);
  });

  it('cualquier otro error no es un pedido cambiado', () => {
    expect(leerPedidoCambiado(error409('PEDIDO_EN_PREPARACION', 'x'))).toBeNull();
    expect(leerPedidoCambiado({ statusCode: 500 })).toBeNull();
    expect(leerPedidoCambiado(null)).toBeNull();
  });
});

describe('Ampliar un pedido en preparación (#287)', () => {
  it('lee el mensaje y solo ofrece «Pedir a Almacén» si viene en Opciones', () => {
    const conAlmacen = leerPedidoEnPreparacion(error409('PEDIDO_EN_PREPARACION', 'El pedido 931007 ya está en preparación.',
      { Pickings: [55], Opciones: ['PedidoNuevo', 'PedirAlmacen'], Productos: ['45929'] }));
    expect(conAlmacen?.mensaje).toBe('El pedido 931007 ya está en preparación.');
    expect(conAlmacen?.puedePedirAlmacen).toBeTrue();
    expect(conAlmacen?.pickings).toEqual([55]);

    const sinAlmacen = leerPedidoEnPreparacion(error409('PEDIDO_EN_PREPARACION', 'x', { Opciones: ['PedidoNuevo'] }));
    expect(sinAlmacen?.puedePedirAlmacen).toBeFalse();
  });

  it('otro error no es un pedido en preparación', () => {
    expect(leerPedidoEnPreparacion(error409('PEDIDO_CAMBIADO', 'x'))).toBeNull();
  });

  it('saca el pedido nuevo de la respuesta o de los datos del aviso', () => {
    expect(pedidoNuevoDeLaAmpliacion({ PedidoNuevo: 931050, Avisos: [] })).toBe(931050);
    expect(pedidoNuevoDeLaAmpliacion({ Avisos: [{ Tipo: 'AmpliacionEnPedidoNuevo', Datos: { PedidoNuevo: 931051, Pedido: 931007 } }] })).toBe(931051);
    expect(pedidoNuevoDeLaAmpliacion({ Avisos: [{ Tipo: 'AmpliacionPedidaAAlmacen', Datos: { Solicitud: 3 } }] })).toBeNull();
    expect(pedidoNuevoDeLaAmpliacion(null)).toBeNull();
  });

  it('enseña solo los avisos de la ampliación', () => {
    expect(mensajesAmpliacionEnPreparacion([
      { Tipo: 'AmpliacionPedidaAAlmacen', Mensaje: 'Se ha preguntado a Almacén.' },
      { Tipo: 'PrepagoConservado', Mensaje: 'no' }
    ])).toEqual(['Se ha preguntado a Almacén.']);
  });
});
