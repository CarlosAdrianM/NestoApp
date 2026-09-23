/** Cuenta bancaria (ficha CCC) de un cliente/contacto, como la devuelve GET api/Clientes/CCCs. */
export interface CCC {
  numero: string;
  pais: string;
  entidad: string;
  oficina: string;
  bic: string;
  estado: number;
  tipoMandato?: number;
  fechaMandato?: Date;
  ibanFormateado: string;
  nombreEntidad: string;
  /** La API no lo manda: usar descripcionCCC(). */
  descripcion?: string;
}

/**
 * NestoApp#189 (Nesto#486): la cuenta con la que la remesa puede girar el recibo. Misma regla que la
 * remesa: ficha activa (Estado >= 0, NestoAPI#502) y con IBAN correcto (la API deja ibanFormateado a
 * null si no pasa la validación, NestoAPI#381).
 */
export function esCCCValido(ccc: CCC | null | undefined): boolean {
  return !!ccc && !!(ccc.numero || '').trim() && ccc.estado >= 0 && !!(ccc.ibanFormateado || '').trim();
}

/** «ES12 …… 4321 — Banco X»: lo justo para reconocer la cuenta sin enseñarla entera. */
export function descripcionCCC(ccc: CCC): string {
  const iban = (ccc.ibanFormateado || '').replace(/\s/g, '');
  const cuenta = iban.length >= 8 ? `${iban.slice(0, 4)} …… ${iban.slice(-4)}` : `Cuenta ${(ccc.numero || '').trim()}`;
  const banco = (ccc.nombreEntidad || '').trim();
  return banco ? `${cuenta} — ${banco}` : cuenta;
}

/**
 * La cuenta que debe llevar el recibo: la que ya tenía la dirección si es válida; si no, la
 * primera válida; si no hay ninguna, null.
 */
export function elegirCCC(cccs: CCC[], actual: string | null | undefined): string | null {
  const validas = (cccs || []).filter(esCCCValido);
  const actualLimpia = (actual || '').toString().trim();
  const actualValida = validas.find(c => c.numero.trim() === actualLimpia);
  if (actualValida) {
    return actualValida.numero.trim();
  }
  return validas.length > 0 ? validas[0].numero.trim() : null;
}
