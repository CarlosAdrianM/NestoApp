/**
 * NestoApp#227 (gemela de NestoAPI#623): origen del cliente para campañas (primer origen META-HARMONIA-0926).
 * GET api/Clientes/Origenes → los activos; el alta manda `Origen` en ClienteCrear. En clientes para contactar los leads
 * de campaña llegan con `Origen = 'LeadCampana'`, prioridad Máxima y el texto («Lead de Meta: llamar antes de las HH:mm»)
 * ya montado por la API en `Motivo`: aquí solo se pintan.
 */
export interface OrigenCliente {
  Codigo: string;
  Descripcion: string;
  Campana?: string | null;
  Activo?: boolean;
  HorasParaLlamar?: number | null;
}

export const ORIGEN_SUGERENCIA_LEAD_CAMPANA = 'LeadCampana';

export function esLeadDeCampana(sugerencia: { Origen?: string | null } | null | undefined): boolean {
  return (sugerencia?.Origen || '').toString().trim() === ORIGEN_SUGERENCIA_LEAD_CAMPANA;
}

/** «Lead de Meta · campaña Harmonia» o el código si la lista no lo trae. */
export function textoOrigenCliente(codigo: string | null | undefined, origenes: OrigenCliente[] | null | undefined): string {
  const buscado = (codigo || '').toString().trim();
  if (!buscado) {
    return '';
  }
  const origen = (origenes || []).find(o => (o.Codigo || '').trim().toUpperCase() === buscado.toUpperCase());
  return origen?.Descripcion?.trim() || buscado;
}
