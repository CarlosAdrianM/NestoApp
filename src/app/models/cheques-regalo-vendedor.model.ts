/**
 * NestoApp#226 (gemela de NestoAPI#593, estadística): qué cheques regalo ha generado, usado y tiene
 * pendientes cada vendedor, para la barrida telefónica del final de la campaña. Mismos permisos que
 * «clientes para contactar» (NestoApp#219). PascalCase, como lo serializa NestoAPI.
 */
export interface CampanaChequesRegalo {
  Codigo: string;
  Descripcion: string;
  Importe: number;
  GeneraDesde: string;
  GeneraHasta: string;
  CanjeHasta: string;
  /** 0 = hoy es el último día. */
  DiasRestantes: number;
  Activa: boolean;
  InicioImpulsoLlamadas: string;
  EnImpulsoLlamadas: boolean;
}

export interface ResumenChequesVendedor {
  Vendedor: string | null;
  Nombre: string;
  Generados: number;
  Usados: number;
  EnPedido: number;
  Servidos: number;
  Pendientes: number;
  PendientesDeActivar: number;
  Caducados: number;
  Anulados: number;
}

/** GET api/ChequesRegalo/Resumen (404 = sin campaña en curso: no se enseña la sección). */
export interface ResumenChequesRegalo {
  Campana: CampanaChequesRegalo;
  Vendedores: ResumenChequesVendedor[];
  Total: ResumenChequesVendedor;
}

/** GET api/ChequesRegalo/Pendientes */
export interface ChequeRegaloPendiente {
  Id: number;
  Campana: string;
  Empresa: string;
  Cliente: string;
  Contacto: string;
  Nombre: string;
  PersonaContacto: string;
  Direccion: string;
  CodigoPostal: string;
  Poblacion: string;
  Provincia: string;
  /** Puede llevar varios separados por «/». */
  Telefono: string;
  Vendedor: string;
  NombreVendedor: string;
  /** Disponible o PendienteDeActivar (con todos=true, también los demás). */
  Estado: string;
  Importe: number;
  FechaActivacion: string | null;
  CanjeHasta: string;
  DiasRestantes: number;
  /** En la serie GB es la 3. */
  EmpresaFactura: string;
  FacturaOrigen: string;
  FechaFactura: string;
  BaseImponibleFactura: number;
  TotalFactura: number;
  PedidoCanje: number | null;
  FechaUltimoContacto: string | null;
  DiasDesdeUltimoContacto: number | null;
  FechaUltimoIntento: string | null;
}

const euros = (importe: number) => (importe || 0).toFixed(2).replace('.', ',') + ' €';

function ddMM(fecha: string | null | undefined): string {
  const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(fecha || '');
  return partes ? `${partes[3]}/${partes[2]}` : '';
}

export function textoDiasRestantesCheque(dias: number): string {
  if (dias === null || dias === undefined) {
    return '';
  }
  if (dias <= 0) {
    return 'Último día';
  }
  return dias === 1 ? 'Queda 1 día' : `Quedan ${dias} días`;
}

/** «Factura NV2616575 del 13/10: 131,83 €» */
export function textoFacturaCheque(cheque: ChequeRegaloPendiente): string {
  if (!cheque?.FacturaOrigen) {
    return '';
  }
  const fecha = ddMM(cheque.FechaFactura);
  return `Factura ${cheque.FacturaOrigen.trim()}${fecha ? ' del ' + fecha : ''}: ${euros(cheque.TotalFactura)}`;
}

export function textoUltimoContactoCheque(cheque: ChequeRegaloPendiente): string {
  const dias = cheque?.DiasDesdeUltimoContacto;
  if (dias === null || dias === undefined) {
    return 'No consta ninguna conversación';
  }
  if (dias === 0) {
    return 'Hablasteis hoy';
  }
  return dias === 1 ? 'Hablasteis ayer' : `Hablasteis hace ${dias} días`;
}

/** El primer móvil (empieza por 6 o 7) de la ficha, para WhatsApp; null si no hay. */
export function movilParaWhatsApp(telefono: string): string | null {
  const numeros = (telefono || '').split(/[/,;]/).map(t => t.replace(/\D/g, '').replace(/^(0034|34)(?=\d{9}$)/, ''));
  return numeros.find(n => /^[67]\d{8}$/.test(n)) || null;
}

export function enlaceWhatsApp(telefono: string): string | null {
  const movil = movilParaWhatsApp(telefono);
  return movil ? `https://wa.me/34${movil}` : null;
}
