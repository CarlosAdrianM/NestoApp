/**
 * NestoApp: globos («consejos», coach marks) para enseñar lo nuevo (NestoAPI#774, gemelas Nesto#592 y Ariadna#75).
 * El contenido vive en la tabla Globos de la API (scripts/Globos_<versión>.sql); la app solo decide DÓNDE pintarlo:
 * junto al control cuya ancla coincide (directiva `globoAncla`) o, sin ancla, como tarjeta centrada.
 *
 * GET  api/Globos?aplicacion=NestoApp&pantalla=&version= → los pendientes del usuario, ya ordenados. Sin script, [].
 * POST api/Globos/{id}/Visto                               → idempotente.
 *
 * En NestoApp la pantalla es la ruta («pedido-venta», «cliente», «recogidas»…) y el ancla «<pantalla>.<Control>».
 */

export const APLICACION_GLOBOS = 'NestoApp';
/** Como en Nesto: como mucho dos al entrar en una pantalla, de uno en uno. */
export const MAX_GLOBOS_SEGUIDOS = 2;
/** Lo que espera un globo a que su control se vea (p. ej. un botón que sale cuando contesta la API). */
export const ESPERA_ANCLA_MS = 10000;

export interface Globo {
  Id: number;
  Aplicacion: string;
  Pantalla: string;
  /** «pedido-venta.PagarAPlazos». Null o vacía: tarjeta centrada. */
  Ancla: string | null;
  Titulo: string | null;
  Texto: string;
  Orden: number;
  /** La novedad que explica, para «Ver la novedad». */
  NovedadId: number | null;
}

/** «/pedido-venta?empresa=1» → «pedido-venta». */
export function pantallaDeUrl(url: string | null | undefined): string {
  return (url || '').split(/[?#]/)[0].replace(/^\/+|\/+$/g, '').split('/')[0] || '';
}

/** Los que tocan ahora: por orden, sin los ya enseñados en esta sesión, como mucho {@link MAX_GLOBOS_SEGUIDOS}. */
export function globosParaEnsenar(globos: Globo[] | null | undefined, yaEnsenados: Set<number>): Globo[] {
  return (globos || [])
    .filter(g => !!g && !yaEnsenados.has(g.Id))
    .sort((a, b) => (a.Orden - b.Orden) || (a.Id - b.Id))
    .slice(0, MAX_GLOBOS_SEGUIDOS);
}
