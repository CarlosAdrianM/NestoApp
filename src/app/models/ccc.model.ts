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
  // Nesto#486 / NestoAPI 69102110: la validez la calcula la API con la regla de la remesa. Una API
  // anterior no los manda: entonces se usa la regla local.
  validoParaRecibo?: boolean;
  /** Por qué no vale (el texto de la remesa), o null si vale. */
  motivoNoValido?: string | null;
  /** La cuenta de la ficha del contacto: la que se pone en el pedido si no se elige otra. */
  esDeLaFicha?: boolean;
}

/**
 * NestoApp#189 (Nesto#486): la cuenta con la que la remesa puede girar el recibo. Manda la API
 * (`validoParaRecibo`, la misma regla con la que la remesa retiene un efecto). Solo si no lo trae
 * (API anterior) se usa la regla local: ficha activa (Estado >= 0, NestoAPI#502) y con IBAN correcto
 * (la API deja ibanFormateado a null si no pasa la validación, NestoAPI#381).
 */
export function esCCCValido(ccc: CCC | null | undefined): boolean {
  if (!ccc || !(ccc.numero || '').trim()) {
    return false;
  }
  if (typeof ccc.validoParaRecibo === 'boolean') {
    return ccc.validoParaRecibo;
  }
  return ccc.estado >= 0 && !!(ccc.ibanFormateado || '').trim();
}

/** Por qué no vale para el recibo (el texto de la API si lo trae), o null si vale. */
export function motivoCCCNoValido(ccc: CCC): string | null {
  if (esCCCValido(ccc)) {
    return null;
  }
  if (ccc.motivoNoValido) {
    return ccc.motivoNoValido;
  }
  if (typeof ccc.validoParaRecibo !== 'boolean' && ccc.estado < 0) {
    return 'La cuenta está de baja o rechazada';
  }
  return 'El IBAN no es correcto';
}

/** «ES12 …… 4321 — Banco X»: lo justo para reconocer la cuenta sin enseñarla entera. */
export function descripcionCCC(ccc: CCC): string {
  const iban = (ccc.ibanFormateado || '').replace(/\s/g, '');
  const cuenta = iban.length >= 8 ? `${iban.slice(0, 4)} …… ${iban.slice(-4)}` : `Cuenta ${(ccc.numero || '').trim()}`;
  const banco = (ccc.nombreEntidad || '').trim();
  return banco ? `${cuenta} — ${banco}` : cuenta;
}

/**
 * La cuenta que debe llevar el recibo: la que ya tenía la dirección si es válida; si no, la de la
 * ficha del contacto si es válida (la que acaba en el pedido); si no, la primera válida; si no hay
 * ninguna, null.
 */
export function elegirCCC(cccs: CCC[], actual: string | null | undefined): string | null {
  const validas = (cccs || []).filter(esCCCValido);
  const actualLimpia = (actual || '').toString().trim();
  const elegida = validas.find(c => c.numero.trim() === actualLimpia)
    || validas.find(c => c.esDeLaFicha)
    || validas[0];
  return elegida ? elegida.numero.trim() : null;
}
