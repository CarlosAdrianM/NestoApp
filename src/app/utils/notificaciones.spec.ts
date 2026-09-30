import { rutaDeNotificacion } from './notificaciones';

/** NestoApp#193 / Nesto#477: a dónde lleva tocar una push. */
describe('rutaDeNotificacion (#193)', () => {
  it('si trae ruta, esa', () => {
    expect(rutaDeNotificacion({ ruta: '/lista-pedidos-venta' })).toBe('/lista-pedidos-venta');
  });

  it('«Te han contestado en Novedades» abre el perfil en la novedad y el comentario', () => {
    const ruta = rutaDeNotificacion({ tipo: 'NovedadComentario', novedadId: '360', comentarioId: '1234' }, 99);

    expect(ruta).toBe('/profile?novedad=360&comentario=1234&aviso=99');
  });

  it('una mención al sugerir no trae comentario: abre la sugerencia', () => {
    expect(rutaDeNotificacion({ tipo: 'NovedadComentario', novedadId: '360' }, 99)).toBe('/profile?novedad=360&aviso=99');
  });

  it('sin ruta ni tipo conocido (o sin novedad), a ningún sitio', () => {
    expect(rutaDeNotificacion({ tipo: 'Otro' })).toBeNull();
    expect(rutaDeNotificacion({ tipo: 'NovedadComentario' })).toBeNull();
    expect(rutaDeNotificacion(undefined)).toBeNull();
  });
});

describe('rutaDeNotificacion: avisos de un pedido (#202 / NestoAPI#555)', () => {
  it('cualquier aviso con el dato «pedido» abre ese pedido', () => {
    const ruta = rutaDeNotificacion({ tipo: 'AvisoPickingConImporte', empresa: '1', pedido: '922500' });
    expect(ruta).toBe('/pedido-venta?empresa=1&numero=922500');
  });

  it('también los tipos que todavía no existen', () => {
    expect(rutaDeNotificacion({ tipo: 'NifIncorrecto', empresa: '3', pedido: '1234' })).toBe('/pedido-venta?empresa=3&numero=1234');
  });

  it('sin empresa, la 1', () => {
    expect(rutaDeNotificacion({ pedido: '922500' })).toBe('/pedido-venta?empresa=1&numero=922500');
    expect(rutaDeNotificacion({ pedido: '922500', empresa: '  ' })).toBe('/pedido-venta?empresa=1&numero=922500');
  });

  it('una ruta explícita manda sobre el pedido', () => {
    expect(rutaDeNotificacion({ ruta: '/ofertas-autorizadas', pedido: '922500' })).toBe('/ofertas-autorizadas');
  });

  it('un pedido que no es un número no lleva a ningún sitio', () => {
    expect(rutaDeNotificacion({ pedido: 'abc' })).toBeNull();
    expect(rutaDeNotificacion({ pedido: '' })).toBeNull();
  });
});
