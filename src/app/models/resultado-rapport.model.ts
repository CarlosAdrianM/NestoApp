/**
 * NestoApp#253 / NestoAPI#716 (datos para los modelos ML.NET de la épica NestoAPI#689): el resultado
 * del rapport, el próximo contacto y el motivo de los cambios de estado del cliente. Catálogos
 * CERRADOS (no texto libre), réplica de ResultadoRapport y MotivoCambioEstadoCliente de NestoAPI.
 * Todo opcional: la app sigue funcionando sin mandarlos.
 */
export interface OpcionCatalogo {
  codigo: string;
  nombre: string;
}

/** Código → texto, en el orden en que se pintan los chips. */
export const RESULTADOS_RAPPORT: OpcionCatalogo[] = [
  { codigo: 'Pedido', nombre: 'Pedido' },
  { codigo: 'PediraMasTarde', nombre: 'Pedirá más tarde' },
  { codigo: 'NoNecesita', nombre: 'No necesita' },
  { codigo: 'Precio', nombre: 'Precio' },
  { codigo: 'Competencia', nombre: 'Competencia' },
  { codigo: 'CerradoTraspaso', nombre: 'Cerrado / traspaso' },
  { codigo: 'SinStock', nombre: 'Sin stock' },
  { codigo: 'NoDecide', nombre: 'No decide' },
  { codigo: 'SoloInformacion', nombre: 'Solo información' },
  { codigo: 'Otro', nombre: 'Otro' }
];

export const RESULTADO_RAPPORT_PEDIDO = 'Pedido';

/** El catálogo del motivo al cambiar el estado del cliente (ficha o «dejar de visitar»). */
export const MOTIVOS_CAMBIO_ESTADO: OpcionCatalogo[] = [
  { codigo: 'Cierre', nombre: 'El centro ha cerrado' },
  { codigo: 'Traspaso', nombre: 'Traspaso' },
  { codigo: 'Competencia', nombre: 'Compra a la competencia' },
  { codigo: 'Impago', nombre: 'Impago' },
  { codigo: 'SinActividad', nombre: 'Sin actividad' },
  { codigo: 'Duplicado', nombre: 'Ficha duplicada' },
  { codigo: 'CambioTitular', nombre: 'Cambio de titular' },
  { codigo: 'PeticionCliente', nombre: 'Lo pide el cliente' },
  { codigo: 'Distribuidor', nombre: 'Pasa a distribuidor' },
  { codigo: 'PublicoFinal', nombre: 'Pasa a público final' },
  { codigo: 'Reactivacion', nombre: 'Reactivación' },
  { codigo: 'Otro', nombre: 'Otro' }
];

/** Longitud de la columna del comentario del cambio de estado en la API. */
export const LONGITUD_COMENTARIO_CAMBIO_ESTADO = 200;

export function nombreResultadoRapport(codigo: string | null | undefined): string {
  const limpio = (codigo || '').trim();
  return RESULTADOS_RAPPORT.find(r => r.codigo === limpio)?.nombre || limpio;
}

export function nombreMotivoCambioEstado(codigo: string | null | undefined): string {
  const limpio = (codigo || '').trim();
  return MOTIVOS_CAMBIO_ESTADO.find(m => m.codigo === limpio)?.nombre || limpio;
}

/**
 * Un chip solo: tocar el que está marcado lo desmarca (se puede dejar sin resultado). Devuelve el
 * código que queda. Con «Pedido» hay que marcar también el check «Pedido» del rapport.
 */
export function alternarResultadoRapport(actual: string | null | undefined, pulsado: string): string | null {
  return (actual || '') === pulsado ? null : pulsado;
}

/** Lo que se manda a la API: solo la fecha (yyyy-MM-dd), sin hora; null si no hay. */
export function proximoContactoParaApi(valor: string | Date | null | undefined): string | null {
  if (!valor) {
    return null;
  }
  if (valor instanceof Date) {
    return `${valor.getFullYear()}-${String(valor.getMonth() + 1).padStart(2, '0')}-${String(valor.getDate()).padStart(2, '0')}`;
  }
  const texto = valor.toString().trim();
  return texto.length >= 10 ? texto.substring(0, 10) : (texto || null);
}

/** El comentario del cambio de estado, recortado a lo que admite la API; null si está vacío. */
export function comentarioCambioEstadoParaApi(texto: string | null | undefined): string | null {
  const limpio = (texto || '').trim();
  return limpio ? limpio.substring(0, LONGITUD_COMENTARIO_CAMBIO_ESTADO) : null;
}
