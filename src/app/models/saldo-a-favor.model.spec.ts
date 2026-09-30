import { SaldoAFavor, importeEnlacePago, textoMovimientoAFavor, textoSaldoAFavorAplicado, hayPendienteDePago } from './saldo-a-favor.model';

/** NestoApp#206 (gemela de Nesto#505): el saldo a favor se enseña; solo se descuenta si se marca. */
describe('Saldo a favor al mandar un enlace de pago (#206)', () => {
  const saldo = (total: number, pendiente = 0): SaldoAFavor => ({
    Total: total, PendienteDePago: pendiente,
    Movimientos: [{ Id: 123, Empresa: '1', Contacto: '0', Fecha: '2026-09-12T00:00:00', Documento: '926100', Concepto: 'Entrega a cuenta', FormaPago: 'TRN', Importe: total }]
  });

  it('sin marcar la casilla, el enlace sale por el total del pedido', () => {
    expect(importeEnlacePago(100, saldo(42.5), false)).toBe(100);
  });

  it('marcada, sale por el total menos lo que tiene a favor', () => {
    expect(importeEnlacePago(100, saldo(42.5), true)).toBe(57.5);
  });

  it('si el saldo cubre el pedido, no queda nada que cobrar', () => {
    expect(importeEnlacePago(30, saldo(42.5), true)).toBe(0);
  });

  it('sin saldo, el total', () => {
    expect(importeEnlacePago(100, null, true)).toBe(100);
  });

  it('redondea a céntimos', () => {
    expect(importeEnlacePago(100.1, saldo(0.2), true)).toBe(99.9);
  });

  it('cada movimiento en una línea: fecha, concepto e importe', () => {
    expect(textoMovimientoAFavor(saldo(30).Movimientos[0])).toBe('12/09/26 · Entrega a cuenta · 30,00 €');
  });

  it('si el cliente también debe, se avisa (puede ser un cobro sin casar)', () => {
    expect(hayPendienteDePago(saldo(42.5, 80))).toBeTrue();
    expect(hayPendienteDePago(saldo(42.5, 0))).toBeFalse();
  });

  it('al crear el pedido recuerda aplicar el saldo en el extracto', () => {
    expect(textoSaldoAFavorAplicado(922500, 42.5, 57.5)).toBe(
      'El enlace de pago sale por 57,50 € (descontados 42,50 € a favor del cliente). Recuerda aplicar ese saldo al pedido 922500 en el extracto: no se compensa solo.');
    expect(textoSaldoAFavorAplicado(922500, 42.5, 0)).toContain('cubre el pedido: no se manda enlace');
  });
});
