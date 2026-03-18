export interface SolicitudPagoTPV {
    Empresa?: string;
    Cliente: string;
    Contacto?: string;
    Importe: number;
    Descripcion: string;
    Correo: string;
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
}
