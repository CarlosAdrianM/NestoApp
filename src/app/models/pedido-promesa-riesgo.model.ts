/**
 * NestoApp#248 (gemela de NestoAPI#693 y de Nesto#546): los pedidos cuya fecha de entrega prometida ya no se cumple (se
 * retrasan o se quedan sin fecha). GET api/PedidosVenta/PromesaEnRiesgo?empresa=1&resueltos=true (sin vendedor: los del
 * vendedor del usuario y su equipo; Dirección, todos) y GET/PUT api/PedidosVenta/PromesaEnRiesgo/Avisos (qué avisos
 * recibe el usuario). PascalCase, como lo serializa NestoAPI. Las fechas son días, sin hora.
 */
export interface PedidoPromesaRiesgo {
  Id: number;
  Empresa: string;
  Pedido: number;
  Cliente: string;
  Contacto: string;
  NombreCliente?: string | null;
  Vendedor?: string | null;
  VendedorPeluqueria?: string | null;
  Ruta?: string | null;
  /** La que se le dio al cliente al crear el pedido. */
  FechaPrometida: string;
  /** La de ahora; null = sin fecha. */
  FechaNueva?: string | null;
  SinFecha?: boolean;
  DiasRetraso?: number | null;
  /** Qué productos fallan y por qué, de usted. */
  Motivo?: string | null;
  Evento?: string | null;
  Detectado?: string | null;
  Actualizado?: string | null;
  /** Solo vienen resueltos si se piden (resueltos=true). */
  Resuelto?: string | null;
  MotivoResolucion?: string | null;
  EstaResuelto?: boolean;
}

export interface OpcionAvisosPromesaRiesgo {
  Valor: string;
  Texto: string;
}

/** Qué avisos de pedidos en riesgo recibe el usuario (Todo | SoloCorreo | SoloCampana | Nada) y las opciones. */
export interface AvisosPromesaRiesgo {
  Valor: string;
  Texto?: string | null;
  Opciones?: OpcionAvisosPromesaRiesgo[];
}

function fechaCorta(fecha: string | null | undefined): string {
  const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(fecha || '');
  return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : '';
}

export function estaResuelto(pedido: PedidoPromesaRiesgo | null | undefined): boolean {
  return !!pedido && (pedido.EstaResuelto === true || !!pedido.Resuelto);
}

export function estaSinFecha(pedido: PedidoPromesaRiesgo | null | undefined): boolean {
  return !!pedido && (pedido.SinFecha === true || !pedido.FechaNueva);
}

/** «Sin fecha», «Se retrasa 8 días», «Se retrasa 1 día» o «Resuelto». */
export function textoEstadoPromesa(pedido: PedidoPromesaRiesgo | null | undefined): string {
  if (!pedido) {
    return '';
  }
  if (estaResuelto(pedido)) {
    return 'Resuelto';
  }
  if (estaSinFecha(pedido)) {
    return 'Sin fecha';
  }
  const dias = +pedido.DiasRetraso || 0;
  return dias <= 0 ? 'En riesgo' : dias === 1 ? 'Se retrasa 1 día' : `Se retrasa ${dias} días`;
}

/** Colores de siempre: rojo sin fecha, naranja retraso, verde resuelto. */
export function colorEstadoPromesa(pedido: PedidoPromesaRiesgo | null | undefined): string {
  return estaResuelto(pedido) ? 'success' : estaSinFecha(pedido) ? 'danger' : 'warning';
}

/** «Prometido el 22/10/2026 · ahora el 30/10/2026» o «Prometido el 22/10/2026 · ahora sin fecha». */
export function textoFechasPromesa(pedido: PedidoPromesaRiesgo | null | undefined): string {
  if (!pedido) {
    return '';
  }
  const prometida = fechaCorta(pedido.FechaPrometida);
  const nueva = estaSinFecha(pedido) ? 'sin fecha' : `el ${fechaCorta(pedido.FechaNueva)}`;
  return `${prometida ? `Prometido el ${prometida} · ` : ''}ahora ${nueva}`;
}

/** «Resuelto el 05/11/2026: vuelve a cumplir la fecha»; '' si sigue en riesgo. */
export function textoResolucionPromesa(pedido: PedidoPromesaRiesgo | null | undefined): string {
  if (!estaResuelto(pedido)) {
    return '';
  }
  const cuando = fechaCorta(pedido.Resuelto);
  const motivo = (pedido.MotivoResolucion || '').trim();
  return `Resuelto${cuando ? ` el ${cuando}` : ''}${motivo ? `: ${motivo}` : ''}`;
}

/** Cuántos siguen en riesgo (los resueltos no cuentan). */
export function pedidosEnRiesgoPendientes(pedidos: PedidoPromesaRiesgo[] | null | undefined): number {
  return (pedidos || []).filter(p => !!p && !estaResuelto(p)).length;
}
