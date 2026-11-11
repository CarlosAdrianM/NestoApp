import {
  PedidoPromesaRiesgo, colorEstadoPromesa, estaResuelto, estaSinFecha, pedidosEnRiesgoPendientes, textoEstadoPromesa, textoFechasPromesa,
  textoResolucionPromesa
} from './pedido-promesa-riesgo.model';

/** NestoApp#248 (NestoAPI#693): pedidos con la fecha prometida en riesgo. */
describe('Pedidos con la fecha en riesgo (#248)', () => {
  const pedido = (cambios: Partial<PedidoPromesaRiesgo> = {}): PedidoPromesaRiesgo => ({
    Id: 1, Empresa: '1', Pedido: 929498, Cliente: '15191', Contacto: '0', NombreCliente: 'PELUQUERÍA ANA', FechaPrometida: '2026-10-22T00:00:00',
    FechaNueva: '2026-10-30T00:00:00', SinFecha: false, DiasRetraso: 8, Motivo: 'El producto 38093 no llega hasta el 30/10.', ...cambios
  });

  it('con fecha nueva dice cuántos días se retrasa, en naranja', () => {
    expect(textoEstadoPromesa(pedido())).toBe('Se retrasa 8 días');
    expect(textoEstadoPromesa(pedido({ DiasRetraso: 1 }))).toBe('Se retrasa 1 día');
    expect(colorEstadoPromesa(pedido())).toBe('warning');
    expect(textoFechasPromesa(pedido())).toBe('Prometido el 22/10/2026 · ahora el 30/10/2026');
  });

  it('sin fecha nueva dice «Sin fecha», en rojo', () => {
    const sinFecha = pedido({ FechaNueva: null, SinFecha: true, DiasRetraso: null });
    expect(estaSinFecha(sinFecha)).toBeTrue();
    expect(textoEstadoPromesa(sinFecha)).toBe('Sin fecha');
    expect(colorEstadoPromesa(sinFecha)).toBe('danger');
    expect(textoFechasPromesa(sinFecha)).toBe('Prometido el 22/10/2026 · ahora sin fecha');
  });

  it('resuelto: en verde, con cuándo y por qué', () => {
    const resuelto = pedido({ Resuelto: '2026-11-05T09:30:00', MotivoResolucion: 'vuelve a cumplir la fecha', EstaResuelto: true });
    expect(estaResuelto(resuelto)).toBeTrue();
    expect(textoEstadoPromesa(resuelto)).toBe('Resuelto');
    expect(colorEstadoPromesa(resuelto)).toBe('success');
    expect(textoResolucionPromesa(resuelto)).toBe('Resuelto el 05/11/2026: vuelve a cumplir la fecha');
    expect(textoResolucionPromesa(pedido())).toBe('');
  });

  it('cuenta los que siguen en riesgo', () => {
    expect(pedidosEnRiesgoPendientes([pedido(), pedido({ Id: 2, Resuelto: '2026-11-05T00:00:00' }), pedido({ Id: 3, FechaNueva: null })])).toBe(2);
    expect(pedidosEnRiesgoPendientes(null)).toBe(0);
  });
});
