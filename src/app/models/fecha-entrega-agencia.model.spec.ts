import { FechaEntregaAgencia, formatearDiaEntrega, textoFechaEntregaAgencia, textoFechaPrometida } from './fecha-entrega-agencia.model';

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
