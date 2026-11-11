/**
 * NestoApp#267 (gemela de NestoAPI#699, corte 2): un envío que la agencia ha devuelto (4) o tiene en incidencia (3) y la
 * decisión del vendedor: ¿el cliente lo sigue queriendo? GET api/EnviosAgencias/Devueltos?empresa=1 (todos los de la empresa,
 * últimos 60 días, sin decidir primero), POST api/EnviosAgencias/{envio}/Reenviar y POST api/EnviosAgencias/{envio}/Abonar.
 * PascalCase, como lo serializa NestoAPI.
 */
export type DecisionEnvioDevuelto = 'SinDecidir' | 'Reenviar' | 'Abonar' | 'EntregadoPorLaAgencia' | string;

export const ESTADO_ENVIO_INCIDENCIA = 3;
export const ESTADO_ENVIO_DEVUELTO = 4;

export interface EnvioDevuelto {
  Numero: number;
  Empresa: string;
  Agencia?: number;
  NombreAgencia?: string | null;
  Cliente: string;
  Contacto: string;
  Pedido?: number | null;
  Estado: number;
  Fecha: string;
  Nombre?: string | null;
  Direccion?: string | null;
  CodPostal?: string | null;
  Poblacion?: string | null;
  Provincia?: string | null;
  Telefono?: string | null;
  Movil?: string | null;
  Email?: string | null;
  Observaciones?: string | null;
  Reembolso?: number;
  Vendedor?: string | null;
  /** El motivo que da la agencia. */
  DetalleEstado?: string | null;
  Decision: DecisionEnvioDevuelto;
  EnvioNuevo?: number | null;
  EnvioAnulado?: number | null;
  EstadoEnvioNuevo?: number | null;
  EnvioNuevoConEtiqueta?: boolean;
  PortesIncluidos?: boolean;
  UsuarioDecision?: string | null;
  FechaDecision?: string | null;
}

/** POST …/Reenviar: lo que no venga se copia del envío devuelto. */
export interface ReenviarEnvio {
  Direccion?: string;
  CodPostal?: string;
  Poblacion?: string;
  Provincia?: string;
  Telefono?: string;
  Movil?: string;
  Observaciones?: string;
  /** Carlos: los portes del reenvío nos los comemos en el 90 % de los casos; por defecto, no. */
  IncluirPortes: boolean;
}

/** Respuesta de Reenviar y de Abonar. */
export interface DecisionReenvio {
  EnvioOrigen: number;
  Pedido?: number | null;
  Decision: DecisionEnvioDevuelto;
  EnvioNuevo?: number | null;
  CodigoBarras?: string | null;
  PortesIncluidos?: boolean;
  Reembolso?: number;
  Avisos?: string[];
  Mensaje?: string | null;
}

export function estaDecidido(envio: EnvioDevuelto | null | undefined): boolean {
  const decision = (envio?.Decision || 'SinDecidir').toString();
  return decision !== 'SinDecidir';
}

/** «Devuelto» o «Con incidencia». */
export function textoEstadoEnvioDevuelto(estado: number | null | undefined): string {
  return +estado === ESTADO_ENVIO_INCIDENCIA ? 'Con incidencia' : 'Devuelto';
}

function formatearFecha(fecha: string | null | undefined): string {
  const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(fecha || '');
  return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : '';
}

/** Quién y cuándo lo decidió, de usted; '' si está sin decidir. */
export function textoDecisionEnvio(envio: EnvioDevuelto | null | undefined): string {
  if (!envio || !estaDecidido(envio)) {
    return '';
  }
  const quien = (envio.UsuarioDecision || '').toString().trim();
  const cuando = formatearFecha(envio.FechaDecision);
  const firma = quien || cuando ? ` Lo decidió ${quien || 'alguien'}${cuando ? ` el ${cuando}` : ''}.` : '';
  switch (envio.Decision) {
    case 'Reenviar':
      return `Ya se decidió volver a enviarlo${envio.EnvioNuevo ? `: envío nuevo ${envio.EnvioNuevo}` : ''}` +
        `${envio.EnvioNuevo ? (envio.EnvioNuevoConEtiqueta ? ' (ya tiene etiqueta)' : ' (pendiente de etiqueta: el almacén la imprime cuando llega la caja)') : ''}.${firma}`;
    case 'Abonar':
      return `Ya se decidió abonarlo: el almacén hace el abono.${firma}`;
    case 'EntregadoPorLaAgencia':
      return `La agencia acabó entregando el envío original${envio.EnvioAnulado ? `; el reenvío ${envio.EnvioAnulado} se anuló` : ''}.`;
    default:
      return `Ya está decidido (${envio.Decision}).${firma}`;
  }
}

/** NestoApp#273: un envío del pedido que la agencia ha devuelto o tiene en incidencia: hay que decir si se reenvía o se abona. */
export function esEnvioDevueltoOIncidentado(estado: number | null | undefined): boolean {
  return +estado === ESTADO_ENVIO_DEVUELTO || +estado === ESTADO_ENVIO_INCIDENCIA;
}

/** NestoApp#273: los del vendedor (sin vendedor, todos) que siguen esperando respuesta. */
export function enviosDevueltosSinContestar(envios: EnvioDevuelto[] | null | undefined, vendedor: string | null): EnvioDevuelto[] {
  return enviosDevueltosVisibles(envios, vendedor, true).filter(e => !estaDecidido(e));
}

/** «Tiene 1 envío devuelto sin contestar» / «Tiene 3 envíos devueltos sin contestar»; '' si no hay ninguno. */
export function textoDevueltosSinContestar(cuantos: number): string {
  const n = +cuantos || 0;
  return n <= 0 ? '' : n === 1 ? 'Tiene 1 envío devuelto sin contestar' : `Tiene ${n} envíos devueltos sin contestar`;
}

/** La lista del vendedor: los suyos (por el campo Vendedor del envío); sin vendedor, todos. Sin decidir primero, luego por fecha. */
export function enviosDevueltosVisibles(envios: EnvioDevuelto[] | null | undefined, vendedor: string | null, soloMios: boolean): EnvioDevuelto[] {
  const codigo = (vendedor || '').toString().trim().toUpperCase();
  return (envios || [])
    .filter(e => !!e)
    .filter(e => !soloMios || !codigo || (e.Vendedor || '').toString().trim().toUpperCase() === codigo)
    .sort((a, b) => {
      const da = estaDecidido(a) ? 1 : 0;
      const db = estaDecidido(b) ? 1 : 0;
      return da !== db ? da - db : (b.Fecha || '').localeCompare(a.Fecha || '');
    });
}

/** Lo que se le dice al vendedor tras reenviar o abonar. */
export function textoResultadoDecision(resultado: DecisionReenvio | null | undefined): string {
  if (!resultado) {
    return '';
  }
  const partes: string[] = [];
  if (resultado.Decision === 'Reenviar') {
    partes.push(resultado.EnvioNuevo
      ? `Se ha creado el envío nuevo ${resultado.EnvioNuevo}${resultado.Pedido ? ` del pedido ${resultado.Pedido}` : ''}. El almacén lo tramita cuando llegue la caja devuelta.`
      : 'Se ha anotado que el cliente lo sigue queriendo.');
    if (resultado.PortesIncluidos) {
      partes.push('Se le cobran los portes del reenvío.');
    }
  } else if (resultado.Decision === 'Abonar') {
    partes.push('Se ha anotado que el cliente no lo quiere: el almacén hará el abono.');
  }
  if ((resultado.Mensaje || '').trim() && !partes.some(p => p.includes((resultado.Mensaje || '').trim()))) {
    partes.push((resultado.Mensaje || '').trim());
  }
  (resultado.Avisos || []).map(a => (a || '').trim()).filter(a => !!a).forEach(a => partes.push(a));
  return partes.join('\n\n');
}
