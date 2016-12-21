import { LineaVenta } from '../LineaVenta/LineaVenta';
export declare class PedidoVenta {
    empresa: string;
    numero: number;
    cliente: string;
    contacto: string;
    fecha: string;
    formaPago: string;
    plazosPago: string;
    primerVencimiento: string;
    iva: string;
    vendedor: string;
    comentarios: string;
    comentarioPicking: string;
    periodoFacturacion: string;
    ruta: string;
    serie: string;
    ccc: string;
    origen: string;
    contactoCobro: string;
    noComisiona: number;
    vistoBuenoPlazosPago: boolean;
    mantenerJunto: boolean;
    servirJunto: boolean;
    usuario: string;
    LineasPedido: Array<LineaVenta>;
}
