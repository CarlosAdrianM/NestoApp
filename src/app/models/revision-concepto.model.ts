/**
 * NestoApp#216 (gemela de NestoAPI#609): antes de crear un enlace de pago, la API propone corregir
 * el concepto (ortografía, tildes, nombres propios). POST api/Pagos/RevisarConcepto. Solo propone:
 * decide el vendedor. PascalCase, como lo serializa NestoAPI.
 */
export interface SolicitudRevisarConcepto {
  Concepto: string;
  Empresa: string;
  Cliente?: string;
}

export interface CambioConcepto {
  De: string;
  A: string;
}

export interface RespuestaRevisarConcepto {
  Original: string;
  Propuesto: string;
  HayCambios: boolean;
  Cambios: CambioConcepto[];
}

/** Hay que preguntar solo si la API propone algo distinto de lo escrito. */
export function hayQuePreguntarConcepto(respuesta: RespuestaRevisarConcepto | null): boolean {
  return !!respuesta?.HayCambios && !!respuesta.Propuesto?.trim();
}

export function textoPreguntaConcepto(respuesta: RespuestaRevisarConcepto): string {
  const cambios = (respuesta.Cambios || []).map(c => `• ${c.De} → ${c.A}`);
  return `«${respuesta.Propuesto}»` + (cambios.length ? `\n\n${cambios.join('\n')}` : '');
}
