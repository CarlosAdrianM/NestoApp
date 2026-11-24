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

/** NestoApp#267 / NestoAPI#699: la push «Envío devuelto del pedido N: ¿lo sigue queriendo el cliente?». */
describe('rutaDeNotificacion: envío devuelto (#267)', () => {
  it('abre la pantalla de decisión del envío (manda el envío, aunque traiga pedido)', () => {
    expect(rutaDeNotificacion({ tipo: 'DevolucionEnvioAgencia', empresa: '1', envio: '123', pedido: '929498', cliente: '15191' }, 5))
      .toBe('/envio-devuelto?empresa=1&envio=123&aviso=5');
  });

  it('sin empresa, la 1; sin envío válido, cae a la regla del pedido', () => {
    expect(rutaDeNotificacion({ tipo: 'DevolucionEnvioAgencia', envio: '123' }, 5)).toBe('/envio-devuelto?empresa=1&envio=123&aviso=5');
    expect(rutaDeNotificacion({ tipo: 'DevolucionEnvioAgencia', pedido: '929498' })).toBe('/pedido-venta?empresa=1&numero=929498');
  });
});

describe('rutaDeNotificacion: leads de campaña (#274)', () => {
  it('un lead nuevo abre la ficha del cliente con su contacto', () => {
    expect(rutaDeNotificacion({ tipo: 'LeadNuevo', empresa: '1', cliente: '40123', contacto: '2', origen: 'META' }))
      .toBe('/cliente?empresa=1&cliente=40123&contacto=2');
  });

  it('el recordatorio de lead sin llamar, también; sin empresa ni contacto, la 1 y el 0', () => {
    expect(rutaDeNotificacion({ tipo: 'LeadSinLlamar', cliente: '40123' })).toBe('/cliente?empresa=1&cliente=40123&contacto=0');
  });

  it('sin cliente, a ningún sitio', () => {
    expect(rutaDeNotificacion({ tipo: 'LeadNuevo', origen: 'META' })).toBeNull();
  });
});

describe('rutaDeNotificacion: recogidas solicitadas (#259, NestoAPI#855)', () => {
  it('confirmada o rechazada abre las recogidas del cliente', () => {
    expect(rutaDeNotificacion({ tipo: 'RecogidaSolicitadaResuelta', id: '7', empresa: '1', cliente: '15191', contacto: '0', estado: 'Confirmada', codigoDocumento: 'NR905123' }, 5))
      .toBe('/recogidas?empresa=1&cliente=15191&contacto=0&aviso=5');
  });

  it('sin respuesta y anulada, también', () => {
    expect(rutaDeNotificacion({ tipo: 'RecogidaSolicitadaSinRespuesta', cliente: '15191', contacto: '2' }, 5)).toBe('/recogidas?empresa=1&cliente=15191&contacto=2&aviso=5');
    expect(rutaDeNotificacion({ tipo: 'RecogidaSolicitadaAnulada', cliente: '15191' }, 5)).toBe('/recogidas?empresa=1&cliente=15191&contacto=0&aviso=5');
  });

  it('sin cliente, a ningún sitio', () => {
    expect(rutaDeNotificacion({ tipo: 'RecogidaSolicitadaResuelta', id: '7' })).toBeNull();
  });
});

/** NestoApp#287, #290, #291 y #280: las push nuevas de noviembre de 2026. */
describe('rutaDeNotificacion: avisos nuevos (#287, #290, #291, #280)', () => {
  it('ampliación de un pedido en preparación: abre el pedido; si lo añadido pasó a uno nuevo, ese', () => {
    expect(rutaDeNotificacion({ tipo: 'AmpliacionPedidoEnPreparacion', accion: 'respuesta', estado: 'Entra', pedido: '931007', picking: '5' }))
      .toBe('/pedido-venta?empresa=1&numero=931007');
    expect(rutaDeNotificacion({ tipo: 'AmpliacionPedidoEnPreparacion', estado: 'NoEntra', empresa: '1', pedido: '931007', pedidoNuevo: '931050' }))
      .toBe('/pedido-venta?empresa=1&numero=931050');
    expect(rutaDeNotificacion({ tipo: 'AmpliacionPedidoEnPreparacion', estado: 'SinRespuesta', pedido: '931007', pedidoNuevo: '' }))
      .toBe('/pedido-venta?empresa=1&numero=931007');
  });

  it('«junto con lo pendiente» esperando 15 días abre el pedido', () => {
    expect(rutaDeNotificacion({ tipo: 'PedidoJuntoConPendienteEsperando', empresa: '1', pedido: '930100', cliente: '15191', contacto: '0', juntoCon: '929701' }))
      .toBe('/pedido-venta?empresa=1&numero=930100');
  });

  it('entrega incompleta del reparto: el pedido si viene; sin pedido, a ningún sitio', () => {
    expect(rutaDeNotificacion({ tipo: 'EntregaIncompletaReparto', empresa: '1', envio: '555', cliente: '15191', pedido: '930200' }))
      .toBe('/pedido-venta?empresa=1&numero=930200');
    expect(rutaDeNotificacion({ tipo: 'EntregaIncompletaReparto', empresa: '1', envio: '555', cliente: '15191' })).toBeNull();
  });

  it('cupón adelantado y el cliente no asiste: abre la ficha del cliente', () => {
    expect(rutaDeNotificacion({ tipo: 'CuponAdelantadoSinAsistir', empresa: '1', cliente: '15191', contacto: '2' }))
      .toBe('/cliente?empresa=1&cliente=15191&contacto=2');
  });

  it('autorización de pedido resuelta: autorizada abre el pedido creado; denegada, la solicitud', () => {
    expect(rutaDeNotificacion({ tipo: 'AutorizacionPedidoResuelta', id: '12', estado: 'Autorizada', empresa: '1', pedido: '931200' }))
      .toBe('/pedido-venta?empresa=1&numero=931200');
    expect(rutaDeNotificacion({ tipo: 'AutorizacionPedidoResuelta', id: '12', estado: 'Denegada', empresa: '1', cliente: '15191' }, 7))
      .toBe('/autorizaciones-pedido?id=12&aviso=7');
    expect(rutaDeNotificacion({ tipo: 'AutorizacionPedidoResuelta', estado: 'Denegada' })).toBeNull();
  });

  it('la recogida que el repartidor no recogió, o recogió con un comentario, abre las recogidas del cliente', () => {
    expect(rutaDeNotificacion({ tipo: 'RecogidaSolicitadaNoRecogida', id: '4', empresa: '1', cliente: '15191', contacto: '0', estado: 'Confirmada', texto: 'Cerrado' }, 3))
      .toBe('/recogidas?empresa=1&cliente=15191&contacto=0&aviso=3');
    expect(rutaDeNotificacion({ tipo: 'RecogidaSolicitadaComentario', id: '4', empresa: '1', cliente: '15191', contacto: '0', estado: 'Recogida', texto: 'Sin el manípulo' }, 3))
      .toBe('/recogidas?empresa=1&cliente=15191&contacto=0&aviso=3');
  });
});
