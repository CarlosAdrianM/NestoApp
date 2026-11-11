/**
 * NestoApp#69 (gemela de Nesto#259): las facturas seleccionadas del extracto, por correo (POST api/Facturas/EnviarPorCorreo,
 * con el correo de Factura Electrónica propuesto por GET api/Facturas/CorreoFacturas) o por WhatsApp (un enlace de descarga
 * por factura, NestoAPI#737). PascalCase en lo que serializa NestoAPI.
 */
export interface FacturaSeleccionada {
  empresa: string;
  numero: string;
  importe: number;
}

export interface ResultadoEnvioFacturasCorreo {
  /** False: el servidor de correo no lo ha aceptado (ni al reintentar). */
  Enviado: boolean;
  Facturas: string[];
  /** Las que se pidieron y no se han podido adjuntar. */
  Omitidas: string[];
  Correos: string[];
  Mensaje?: string | null;
}

export function textoResultadoEnvioFacturas(resultado: ResultadoEnvioFacturasCorreo | null | undefined): string {
  if (!resultado) {
    return '';
  }
  const partes: string[] = [];
  if ((resultado.Mensaje || '').trim()) {
    partes.push((resultado.Mensaje || '').trim());
  } else if (resultado.Enviado !== false) {
    const n = (resultado.Facturas || []).length;
    partes.push(`${n === 1 ? 'Se ha enviado la factura' : `Se han enviado ${n} facturas`} a ${(resultado.Correos || []).join(', ')}.`);
  } else {
    partes.push('El servidor de correo no ha aceptado el envío. Inténtelo otra vez en un rato.');
  }
  if ((resultado.Omitidas || []).length) {
    partes.push(`No se han podido adjuntar: ${resultado.Omitidas.join(', ')}.`);
  }
  return partes.join('\n\n');
}

/**
 * NestoApp#272: si el servidor de correo no acepta el envío, la API contesta 502 con el mismo resultado (Enviado = false y
 * el motivo en Mensaje). Lo saca del error (envuelto por el interceptor o directo); null si el error es otra cosa.
 */
export function resultadoDeErrorEnvioFacturas(error: any): ResultadoEnvioFacturasCorreo | null {
  const cuerpo = error?.originalError?.error ?? error?.error;
  return cuerpo && typeof cuerpo === 'object' && cuerpo.Enviado === false ? cuerpo as ResultadoEnvioFacturasCorreo : null;
}
