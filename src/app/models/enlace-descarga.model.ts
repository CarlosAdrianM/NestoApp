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

/** «Buenos días», «Buenas tardes» o «Buenas noches», como lo hace la API. */
export function saludoSegunHora(ahora: Date): string {
  const hora = ahora.getHours();
  return hora < 14 ? 'Buenos días' : hora < 21 ? 'Buenas tardes' : 'Buenas noches';
}

function formatearImporte(importe: number): string {
  return (+importe || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function formatearFechaCorta(fecha: string | null | undefined): string {
  const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(fecha || '');
  return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : '';
}

/**
 * NestoApp#69: un solo mensaje con varios documentos, con la misma forma que el Texto de la API para uno (de usted, con el
 * enlace de cada uno y hasta cuándo está disponible). Con uno solo, el Texto de la API tal cual.
 */
export function textoWhatsAppVarios(enlaces: EnlaceDescarga[], ahora: Date = new Date()): string {
  const lista = (enlaces || []).filter(e => !!e?.Url);
  if (lista.length === 0) {
    return '';
  }
  if (lista.length === 1) {
    return lista[0].Texto || lista[0].Url;
  }
  const esPedido = (lista[0].Tipo || '').toString().toLowerCase().startsWith('pedido');
  const nombre = (lista[0].Nombre || '').trim();
  const lineas = lista.map(e => `- ${esPedido ? 'Pedido' : 'Factura'} ${(e.Numero || '').trim()}${+e.Importe ? ` (${formatearImporte(e.Importe)})` : ''}: ${e.Url}`);
  const caduca = lista.map(e => e.Caduca).filter(c => !!c).sort()[0];
  return `${saludoSegunHora(ahora)}${nombre ? `, ${nombre}` : ''}:\n\n` +
    `Le enviamos sus ${esPedido ? 'pedidos' : 'facturas'}. Puede descargar${esPedido ? 'los' : 'las'} en PDF desde estos enlaces:\n${lineas.join('\n')}\n\n` +
    (caduca ? `Los enlaces estarán disponibles hasta el ${formatearFechaCorta(caduca)}.\n\n` : '') +
    'Un saludo,\nNueva Visión';
}

/** «…123» para distinguir los móviles al elegir uno. */
export function textoMovil(movil: string): string {
  const numero = (movil || '').toString().trim();
  return numero.startsWith('34') && numero.length === 11 ? `${numero.substring(2, 5)} ${numero.substring(5, 8)} ${numero.substring(8)}` : `+${numero}`;
}
