import {LineaVenta} from '../LineaVenta/LineaVenta';

export class PedidoVenta {
    public empresa: string;
    public numero: number;
    public cliente: string;
    public contacto: string;
    public fecha: string; // Date
    public formaPago: string;
    public plazosPago: string;
    public primerVencimiento: string; // Date
    public iva: string;
    public vendedor: string;
    public comentarios: string;
    public comentarioPicking: string;
    public periodoFacturacion: string;
    public ruta: string;
    public serie: string;
    public ccc: string;
    public origen: string;
    public contactoCobro: string;
    public noComisiona: number;
    public vistoBuenoPlazosPago: boolean;
    public mantenerJunto: boolean;
    public servirJunto: boolean;
    public usuario: string;
    
    public LineasPedido: Array<LineaVenta>;
}