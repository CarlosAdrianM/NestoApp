import { RetencionPorFalta, retencionPendienteDelPedido, textoAvisoRetenidosPorFalta, textoPlazoRetencionPorFalta, textoRetencionPorFalta } from './retencion-por-falta.model';

describe('Pedido «todo junto» retenido por una falta (#279, NestoAPI#858)', () => {
  const retencion = (extra: Partial<RetencionPorFalta> = {}): RetencionPorFalta => ({
    Id: 1, Empresa: '1  ', Pedido: 905123, Picking: 77, Cliente: '15191', Contacto: '0', NombreCliente: 'PELUQUERÍA LOLA',
    Productos: '41234 CHAMPÚ X 1L', Fecha: '2026-11-13T10:00:00', Plazo: '2026-11-13T12:30:00', Estado: 'Pendiente',
    UsuarioDecision: null, FechaDecision: null, PorPlazo: false, PuedeDecidir: true, Mensaje: null, ...extra
  });
  const hoy = new Date(2026, 10, 13, 11, 0, 0);

  describe('textoPlazoRetencionPorFalta', () => {
    it('hoy: «antes de las 12:30»', () => {
      expect(textoPlazoRetencionPorFalta('2026-11-13T12:30:00', hoy)).toBe('antes de las 12:30');
    });
    it('otro día: «antes del 14/11 a las 09:05»', () => {
      expect(textoPlazoRetencionPorFalta('2026-11-14T09:05:00', hoy)).toBe('antes del 14/11 a las 09:05');
    });
    it('sin plazo, nada', () => {
      expect(textoPlazoRetencionPorFalta(null, hoy)).toBe('');
    });
  });

  it('textoRetencionPorFalta: el producto que falta y hasta cuándo', () => {
    expect(textoRetencionPorFalta(retencion(), hoy))
      .toBe('Retenido por una falta (41234 CHAMPÚ X 1L). Decida antes de las 12:30; si no, se esperará a tenerlo completo.');
  });

  describe('retencionPendienteDelPedido', () => {
    it('la Pendiente de ese pedido y empresa (con espacios)', () => {
      const lista = [retencion({ Pedido: 1 }), retencion()];
      expect(retencionPendienteDelPedido(lista, '1', 905123)?.Pedido).toBe(905123);
    });
    it('null si ya está decidida o es de otro pedido', () => {
      expect(retencionPendienteDelPedido([retencion({ Estado: 'Esperar' })], '1', 905123)).toBeNull();
      expect(retencionPendienteDelPedido([retencion()], '1', 1)).toBeNull();
      expect(retencionPendienteDelPedido(null, '1', 905123)).toBeNull();
    });
  });

  describe('textoAvisoRetenidosPorFalta (lista de pedidos)', () => {
    it('uno: con su plazo', () => {
      expect(textoAvisoRetenidosPorFalta([retencion()], hoy)).toBe('1 pedido retenido por una falta: decida antes de las 12:30');
    });
    it('varios: el plazo más cercano', () => {
      const lista = [retencion({ Plazo: '2026-11-13T13:00:00' }), retencion({ Pedido: 2, Plazo: '2026-11-13T12:00:00' })];
      expect(textoAvisoRetenidosPorFalta(lista, hoy)).toBe('2 pedidos retenidos por una falta: el primero, antes de las 12:00');
    });
    it('ninguno, nada', () => {
      expect(textoAvisoRetenidosPorFalta([], hoy)).toBe('');
    });
  });
});
