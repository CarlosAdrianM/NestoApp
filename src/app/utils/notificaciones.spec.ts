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

/** NestoApp#236 / NestoAPI#666: incidencia de la agencia en un envío. */
describe('rutaDeNotificacion: incidencia de agencia (#236)', () => {
  it('con pedido, abre el pedido', () => {
    expect(rutaDeNotificacion({ tipo: 'IncidenciaEnvioAgencia', empresa: '1', envio: '123', cliente: '15191', pedido: '928521' }))
      .toBe('/pedido-venta?empresa=1&numero=928521');
  });

  it('sin pedido, abre la ficha del cliente', () => {
    expect(rutaDeNotificacion({ tipo: 'IncidenciaEnvioAgencia', empresa: '1', envio: '123', cliente: '15191' }))
      .toBe('/cliente?empresa=1&cliente=15191&contacto=0');
  });

  it('sin pedido ni cliente, a ningún sitio', () => {
    expect(rutaDeNotificacion({ tipo: 'IncidenciaEnvioAgencia', empresa: '1', envio: '123' })).toBeNull();
  });
});

/** NestoApp#247 / NestoAPI#692: anuncio de un evento nuevo. */
describe('rutaDeNotificacion: anuncio de evento (#247)', () => {
  it('abre la ficha del evento', () => {
    expect(rutaDeNotificacion({ tipo: 'AnuncioEvento', eventoId: '12', fecha: '2026-11-15', formato: 'Presencial' }, 7))
      .toBe('/evento?id=12&aviso=7');
  });

  it('sin eventoId válido, a ningún sitio', () => {
    expect(rutaDeNotificacion({ tipo: 'AnuncioEvento' })).toBeNull();
    expect(rutaDeNotificacion({ tipo: 'AnuncioEvento', eventoId: 'x' })).toBeNull();
  });
});

/** NestoApp#254 / NestoAPI#698: la campana de los pedidos retenidos abre el pedido. */
describe('rutaDeNotificacion: pedido retenido (#254)', () => {
  it('liberado o recordatorio, abre el pedido', () => {
    expect(rutaDeNotificacion({ tipo: 'PedidoRetenido', accion: 'liberado', empresa: '1', pedido: '929057', cliente: '15191' }))
      .toBe('/pedido-venta?empresa=1&numero=929057');
    expect(rutaDeNotificacion({ tipo: 'PedidoRetenido', accion: 'recordatorio', empresa: '1', pedido: '929057' }))
      .toBe('/pedido-venta?empresa=1&numero=929057');
  });
});
