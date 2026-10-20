export interface SolicitudPagoTPV {
    Empresa?: string;
    Cliente: string;
    Contacto?: string;
    Importe: number;
    Descripcion: string;
    Correo: string;
    Movil?: string;
    Efectos?: EfectoAPagar[];
}

export interface EfectoAPagar {
    ExtractoClienteId: number;
    Importe: number;
    Documento?: string;
    Efecto?: string;
    Contacto?: string;
    Vendedor?: string;
    FormaVenta?: string;
    Delegacion?: string;
    TipoApunte?: string;
}

export interface RespuestaIniciarPago {
    IdPago: number;
    UrlRedsys: string;
    Ds_SignatureVersion: string;
    Ds_MerchantParameters: string;
    Ds_Signature: string;
    TokenAcceso: string;
    UrlPaginaPago: string;
    /**
     * NestoAPI#679: avisos al generar el enlace (p. ej. el pedido va contra reembolso). Nunca
     * bloquean: el enlace ya está creado. Una API vieja no los manda.
     */
    Avisos?: AvisoEnlacePago[];
}

export interface AvisoEnlacePago {
    /** EnvioEnCaminoConReembolso | PedidoContraReembolso */
    Codigo: string;
    Texto: string;
}

/** Los textos de los avisos, uno por párrafo; vacío si no hay ninguno. */
export function textoAvisosEnlacePago(respuesta: RespuestaIniciarPago | null | undefined): string {
    return (respuesta?.Avisos || []).map(a => (a?.Texto || '').trim()).filter(t => !!t).join('\n\n');
}
