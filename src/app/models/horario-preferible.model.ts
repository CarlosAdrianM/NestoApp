/**
 * NestoApp#260 (gemela de NestoAPI#763 y Nesto#584): «horario preferible» de entrega del cliente/contacto.
 * GET/PUT api/Clientes/{empresa}/{cliente}/{contacto}/HorarioPreferible. PascalCase, como lo serializa NestoAPI.
 * Para el PUT basta con `Texto` («L-V 10:00-14:00, 17:00-20:00; S 10:00-13:00»); vacío borra el horario.
 * Regla de Carlos: se llama «horario preferible», nunca «horario de entrega», y los textos nunca prometen que se respeta.
 */
export interface FranjaHorarioPreferible {
  /** 1 = lunes … 7 = domingo. */
  DiaSemana: number;
  Desde: string;
  Hasta: string;
}

export interface HorarioPreferible {
  Empresa?: string;
  Cliente?: string;
  Contacto?: string;
  Franjas?: FranjaHorarioPreferible[];
  /** El horario en texto; vacío si no tiene. */
  Texto?: string | null;
  /** Lo que hay que enseñar siempre junto al horario. */
  Aviso?: string | null;
  Usuario?: string | null;
  FechaModificacion?: string | null;
}

export const AVISO_HORARIO_PREFERIBLE = 'Horario preferible del cliente: lo intentaremos, pero no hay compromiso de respetarlo.';
export const EJEMPLO_HORARIO_PREFERIBLE = 'L-V 10:00-14:00, 17:00-20:00; S 10:00-13:00';

export function textoHorarioPreferible(horario: HorarioPreferible | null | undefined): string {
  const texto = (horario?.Texto || '').toString().trim();
  return texto || 'Sin horario preferible';
}

export function avisoHorarioPreferible(horario: HorarioPreferible | null | undefined): string {
  return (horario?.Aviso || '').toString().trim() || AVISO_HORARIO_PREFERIBLE;
}
