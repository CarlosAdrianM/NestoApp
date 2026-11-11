import { Novedad, compararVersiones } from '../services/novedades.service';

/**
 * NestoApp#177 fase 2 (NestoAPI#495): el aviso «qué hay de nuevo» va por Id, no por versión, para que también se enseñen
 * las novedades de ámbito NestoAPI (cambios que el vendedor nota sin que se publique la app). Se pide
 * GET api/Novedades?ambitos=NestoApp,NestoAPI&desdeId=<última vista> y la última vista se guarda en el parámetro de
 * usuario UltimaNovedadVistaApp.
 */
export const CLAVE_ULTIMA_NOVEDAD_VISTA = 'UltimaNovedadVistaApp';
export const AMBITOS_AVISO_NOVEDADES = 'NestoApp,NestoAPI';
const AMBITO_APP = 'NestoApp';

/** Una novedad de la app de una versión posterior a la instalada: «Aún no ha llegado a tu móvil», todavía no se avisa. */
function aunNoHaLlegado(novedad: Novedad, versionInstalada: string): boolean {
  return (novedad?.Ambito || '').trim() === AMBITO_APP && !!novedad.Version && compararVersiones(novedad.Version, versionInstalada) > 0;
}

/**
 * De las nuevas, las que se le cuentan ya al vendedor: con versión (las sugerencias de otros usuarios no son novedades),
 * que no se hayan avisado ya en este móvil y, si son de la app, de la versión instalada o anteriores. De la más nueva a la más antigua.
 */
export function novedadesParaAvisar(nuevas: Novedad[] | null | undefined, versionInstalada: string, yaAvisadas: number[] = []): Novedad[] {
  return (nuevas || [])
    .filter(n => !!n && !!n.Version && !aunNoHaLlegado(n, versionInstalada) && !(yaAvisadas || []).includes(n.Id))
    .sort((a, b) => b.Id - a.Id);
}

/**
 * Hasta qué Id se da por visto: el mayor de las nuevas, salvo que alguna de la app aún no haya llegado al móvil; entonces
 * se queda justo antes de la primera de esas, para avisarla cuando llegue su versión. Nunca retrocede.
 */
export function siguienteUltimaNovedadVista(nuevas: Novedad[] | null | undefined, versionInstalada: string, actual: number): number {
  const lista = (nuevas || []).filter(n => !!n && +n.Id > 0);
  const pendientes = lista.filter(n => aunNoHaLlegado(n, versionInstalada)).map(n => +n.Id);
  const tope = pendientes.length ? Math.min(...pendientes) - 1 : Math.max(0, ...lista.map(n => +n.Id));
  return Math.max(+actual || 0, tope);
}

/**
 * La primera vez no se cuenta todo el histórico: solo lo que estrena la versión de la app que el vendedor tiene instalada.
 */
export function novedadesDeLaVersionInstalada(nuevas: Novedad[] | null | undefined, versionInstalada: string): Novedad[] {
  return novedadesParaAvisar(nuevas, versionInstalada).filter(n => seVeEnElPerfil(n) && compararVersiones(n.Version, versionInstalada) === 0);
}

/** El parámetro tal como viene de la API: '' (o algo que no es un número) = nunca ha visto nada → null. */
export function ultimaNovedadVistaDe(valor: any): number | null {
  const texto = (valor ?? '').toString().trim();
  return /^\d+$/.test(texto) ? +texto : null;
}

/** Las de la app se leen enteras en el perfil; las demás (NestoAPI) no salen allí, así que su explicación va en el aviso. */
export function seVeEnElPerfil(novedad: Novedad | null | undefined): boolean {
  return (novedad?.Ambito || '').trim() === AMBITO_APP;
}

/**
 * El texto del aviso: un título por línea (con su explicación si no es de la app), como mucho `maximo`, y cuántas más hay.
 */
export function textoAvisoNovedades(novedades: Novedad[], maximo: number = 6): string {
  const lista = novedades || [];
  const lineas = lista.slice(0, maximo).map(n => {
    const descripcion = seVeEnElPerfil(n) ? '' : (n.Descripcion || '').trim();
    return `• ${(n.Titulo || '').trim()}${descripcion ? `: ${descripcion}` : ''}`;
  });
  const resto = lista.length - lineas.length;
  if (resto > 0) {
    lineas.push(resto === 1 ? 'y 1 más' : `y ${resto} más`);
  }
  return lineas.join('\n');
}
