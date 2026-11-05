/**
 * NestoApp#261 (gemela de NestoAPI#737 / Nesto#570): enlace público de descarga de un pedido o una factura para mandarlo
 * por WhatsApp. POST api/Documentos/EnlaceDescarga { Tipo: 'Pedido'|'Factura', Empresa, Numero }. PascalCase.
 */
export type TipoDocumentoEnlace = 'Pedido' | 'Factura';

export interface EnlaceDescarga {
  Url: string;
  Caduca: string;
  Tipo: string;
  Numero: string;
  Cliente?: string;
  Contacto?: string;
  Nombre?: string;
  Importe?: number;
  /** Móviles del cliente en formato internacional sin «+» (34…); vacía si no tiene. */
  Moviles: string[];
  /** El mensaje para el cliente, de usted y con el enlace: el usuario solo pulsa «Enviar». */
  Texto: string;
}

/** Enlace de WhatsApp con el texto ya escrito; sin móvil, se abre WhatsApp para que se elija el contacto. */
export function urlWhatsApp(movil: string | null | undefined, texto: string): string {
  const numero = (movil || '').toString().replace(/[^\d]/g, '');
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto || '')}`;
}

/** «…123» para distinguir los móviles al elegir uno. */
export function textoMovil(movil: string): string {
  const numero = (movil || '').toString().trim();
  return numero.startsWith('34') && numero.length === 11 ? `${numero.substring(2, 5)} ${numero.substring(5, 8)} ${numero.substring(8)}` : `+${numero}`;
}
