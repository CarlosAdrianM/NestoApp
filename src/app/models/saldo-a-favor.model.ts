/**
 * NestoApp#206 (gemela de Nesto#505): lo que el cliente tiene a su favor en el extracto, para avisar
 * al vendedor cuando va a mandar un enlace de pago. GET api/ExtractosCliente/SaldoAFavor. PascalCase,
 * como lo serializa NestoAPI.
 *
 * Decisión de Carlos (30/09/26): solo informar, nunca descontar solo. Ese saldo puede ser una
 * entrega a cuenta de otro pedido o una reserva; el vendedor lo mira y, si quiere, lo marca.
 */
export interface MovimientoAFavor {
  Id: number;
  Empresa: string;
  Contacto: string;
  Fecha: string;
  Documento: string;
  Concepto: string;
  FormaPago: string;
  /** En positivo. */
  Importe: number;
}

export interface SaldoAFavor {
  /** Suma de lo que hay a favor, en positivo. 0 si no hay nada. */
  Total: number;
  /** Lo que el cliente debe: si no es cero, parte de lo «a favor» puede ser un cobro sin casar. */
  PendienteDePago: number;
  Movimientos: MovimientoAFavor[];
}

const redondear = (valor: number) => Math.round(valor * 100) / 100;

/** Por cuánto sale el enlace: el total, o el total menos el saldo si el vendedor lo ha marcado. */
export function importeEnlacePago(totalPedido: number, saldo: SaldoAFavor | null, descontar: boolean): number {
  if (!descontar || !saldo || !(saldo.Total > 0)) {
    return redondear(totalPedido);
  }
  return Math.max(0, redondear(totalPedido - saldo.Total));
}

export function formatearEuros(importe: number): string {
  return (importe || 0).toFixed(2).replace('.', ',') + ' €';
}

/** «12/09/26 · Entrega a cuenta · 30,00 €», como en Nesto. */
export function textoMovimientoAFavor(movimiento: MovimientoAFavor): string {
  const [anno, mes, dia] = (movimiento.Fecha || '').substring(0, 10).split('-');
  const fecha = dia ? `${dia}/${mes}/${anno.substring(2)}` : '';
  return [fecha, (movimiento.Concepto || movimiento.Documento || '').trim(), formatearEuros(movimiento.Importe)]
    .filter(t => !!t).join(' · ');
}

export function hayPendienteDePago(saldo: SaldoAFavor | null): boolean {
  return !!saldo && saldo.PendienteDePago > 0;
}

/**
 * Lo que se le dice al vendedor al crear el pedido si ha descontado el saldo: por cuánto ha salido el
 * enlace (o que no se ha mandado, si lo cubría entero) y que hay que aplicarlo en el extracto.
 */
export function textoSaldoAFavorAplicado(numeroPedido: any, saldo: number, importeEnlace: number): string {
  const enlace = importeEnlace > 0
    ? `El enlace de pago sale por ${formatearEuros(importeEnlace)} (descontados ${formatearEuros(saldo)} a favor del cliente).`
    : `El saldo a favor del cliente (${formatearEuros(saldo)}) cubre el pedido: no se manda enlace de pago.`;
  return `${enlace} Recuerda aplicar ese saldo al pedido ${numeroPedido} en el extracto: no se compensa solo.`;
}
