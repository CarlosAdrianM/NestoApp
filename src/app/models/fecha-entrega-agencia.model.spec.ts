import { FechaEntregaAgencia, PartidaFechaEntregaAgencia, detallePorLinea, formatearDiaEntrega, formatearDiaRelativo, fraseDetallePartida, textoFechaEntregaAgencia, textoFechaPrometida } from './fecha-entrega-agencia.model';

/** NestoApp#215 (gemela de NestoAPI#606): fecha de entrega a la agencia. */
describe('Fecha de entrega a la agencia (#215)', () => {
  const fecha = (cambios: Partial<FechaEntregaAgencia> = {}): FechaEntregaAgencia => ({
    PrimeraEntrega: '2026-10-15T00:00:00', EntregaCompleta: '2026-10-15T00:00:00', FechaEntregaAgencia: '2026-10-15T00:00:00',
    Aplica: 'Completa', Entregas: ['2026-10-15T00:00:00'], Motivo: 'Todo tiene stock en Algete', FechaPrometida: null, ...cambios
  });

  it('día de la semana y dd/MM, sin que la zona horaria lo mueva', () => {
    expect(formatearDiaEntrega('2026-10-15T00:00:00')).toBe('jueves 15/10');
    expect(formatearDiaEntrega('2026-10-13T00:00:00Z')).toBe('martes 13/10');
    expect(formatearDiaEntrega(null)).toBe('');
  });

  it('frase de la plantilla', () => {
    expect(textoFechaEntregaAgencia(fecha())).toBe('Se entrega a la agencia el jueves 15/10');
  });

  it('con la primera entrega, también cuándo sale lo que falta', () => {
    expect(textoFechaEntregaAgencia(fecha({ Aplica: 'Primera', FechaEntregaAgencia: '2026-10-13T00:00:00', EntregaCompleta: '2026-10-20T00:00:00' })))
      .toBe('Se entrega a la agencia el martes 13/10 (lo que falta, el martes 20/10)');
  });

  it('sin fecha (falta de proveedor o sobre pedido)', () => {
    expect(textoFechaEntregaAgencia(fecha({ FechaEntregaAgencia: null }))).toBe('Todavía no hay fecha de entrega a la agencia');
  });

  it('sin respuesta, nada', () => {
    expect(textoFechaEntregaAgencia(null)).toBe('');
  });

  it('la prometida solo si difiere de la de ahora', () => {
    expect(textoFechaPrometida(fecha({ FechaPrometida: '2026-10-15T00:00:00' }))).toBe('');
    expect(textoFechaPrometida(fecha({ FechaPrometida: '2026-10-14T00:00:00' }))).toBe('Al crear el pedido se prometió el miércoles 14/10');
    expect(textoFechaPrometida(fecha())).toBe('');
  });
});

/** NestoApp#266 (gemela de Nesto#599) y #207 (NestoAPI#577): por qué cada producto no sale directamente de Algete. */
describe('Detalle por producto de la fecha de entrega (#266, #207)', () => {
  const hoy = new Date(2026, 10, 3); // martes 03/11/2026
  const partida = (cambios: Partial<PartidaFechaEntregaAgencia>): PartidaFechaEntregaAgencia =>
    ({ Origen: 'Algete', Producto: '44873', Unidades: 1, ...cambios });

  it('«hoy», «mañana» o el día con artículo (y el año si no es el de hoy)', () => {
    expect(formatearDiaRelativo('2026-11-03T00:00:00', hoy, true)).toBe('hoy');
    expect(formatearDiaRelativo('2026-11-04T00:00:00', hoy, true)).toBe('mañana');
    expect(formatearDiaRelativo('2026-11-05T00:00:00', hoy, true)).toBe('el jueves 05/11');
    expect(formatearDiaRelativo('2026-11-05T00:00:00', hoy, false)).toBe('jueves 05/11');
    expect(formatearDiaRelativo('2027-01-07T00:00:00', hoy, true)).toBe('el jueves 07/01/2027');
    expect(formatearDiaRelativo(null, hoy, true)).toBe('');
  });

  it('kit que se desmonta (mismos textos que Nesto)', () => {
    expect(fraseDetallePartida(partida({ Origen: 'Kit', Kit: '43165' }), hoy)).toBe('44873: 1 unidad sale desmontando el kit 43165.');
    expect(fraseDetallePartida(partida({ Origen: 'Kit', Kit: '43165', Unidades: 2 }), hoy)).toBe('44873: 2 unidades salen desmontando el kit 43165.');
  });

  it('en una tienda: llega con la reposición y puede salir', () => {
    expect(fraseDetallePartida(partida({ Origen: 'Tienda', Producto: '45363', Tienda: 'REI', PuedeSalirEl: '2026-11-05T00:00:00' }), hoy))
      .toBe('45363: 1 unidad en Reina: llega con la reposición y puede salir el jueves 05/11.');
  });

  it('#207: si la API dice qué día llega la reposición a Algete, se dice también', () => {
    expect(fraseDetallePartida(partida({ Origen: 'Tienda', Producto: '34129', Tienda: 'REI', LlegaAAlgete: '2026-11-05T12:00:00', PuedeSalirEl: '2026-11-06T00:00:00' }), hoy))
      .toBe('34129: 1 unidad en Reina: llega con la reposición el jueves 05/11 y puede salir el viernes 06/11.');
    expect(fraseDetallePartida(partida({ Origen: 'Tienda', Tienda: 'ALC', Unidades: 3 }), hoy))
      .toBe('44873: 3 unidades en Alcobendas: llegan con la reposición.');
  });

  it('en camino, proveedor y sin stock', () => {
    expect(fraseDetallePartida(partida({ Origen: 'EnCamino', PuedeSalirEl: '2026-11-04T00:00:00' }), hoy)).toBe('44873: 1 unidad ya viene de camino desde una tienda y puede salir mañana.');
    expect(fraseDetallePartida(partida({ Origen: 'Proveedor', FechaPrevistaProveedor: '2026-11-10T00:00:00', PuedeSalirEl: '2026-11-11T00:00:00' }), hoy))
      .toBe('44873: 1 unidad del proveedor (prevista el martes 10/11) y puede salir el miércoles 11/11.');
    expect(fraseDetallePartida(partida({ Origen: 'Proveedor', FechaPrevistaProveedor: '2026-10-20T00:00:00', LlegadaSupuesta: '2026-11-06T00:00:00', PuedeSalirEl: '2026-11-06T00:00:00' }), hoy))
      .toBe('44873: 1 unidad del proveedor (la fecha prevista, martes 20/10, ya pasó) y puede salir el viernes 06/11.');
    expect(fraseDetallePartida(partida({ Origen: 'SinStock', Producto: '32565' }), hoy)).toBe('32565: 1 unidad sin stock y sin fecha de llegada.');
    expect(fraseDetallePartida(partida({ Origen: 'SinStock', MotivoSinFecha: 'Sobre pedido.' }), hoy)).toBe('44873: 1 unidad sin fecha: Sobre pedido.');
  });

  it('lo que ya está en Algete o en picking no se explica', () => {
    expect(fraseDetallePartida(partida({ Origen: 'Algete' }), hoy)).toBeNull();
    expect(fraseDetallePartida(partida({ Origen: 'Picking' }), hoy)).toBeNull();
    expect(fraseDetallePartida(partida({ Origen: 'Tienda', Unidades: 0 }), hoy)).toBeNull();
    expect(fraseDetallePartida(null, hoy)).toBeNull();
  });

  it('la lista: una frase por partida que lo necesite; nada sin Desglose (API vieja)', () => {
    const fecha: FechaEntregaAgencia = {
      PrimeraEntrega: null, EntregaCompleta: null, FechaEntregaAgencia: null, Aplica: 'Completa', Entregas: [], Motivo: null, FechaPrometida: null,
      Desglose: [partida({ Origen: 'Algete' }), partida({ Origen: 'Kit', Kit: '43165' }), partida({ Origen: 'SinStock', Producto: '32565' })]
    };
    expect(detallePorLinea(fecha, hoy)).toEqual(['44873: 1 unidad sale desmontando el kit 43165.', '32565: 1 unidad sin stock y sin fecha de llegada.']);
    expect(detallePorLinea({ ...fecha, Desglose: undefined }, hoy)).toEqual([]);
    expect(detallePorLinea(null, hoy)).toEqual([]);
  });
});
