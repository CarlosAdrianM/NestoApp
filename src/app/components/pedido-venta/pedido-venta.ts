import { LineaVenta } from '../linea-venta/linea-venta';

export class PedidoVenta {
    public empresa: string;
    public numero: number;
    public cliente: string;
    public contacto: string;
    public fecha: string; // Date
    public formaPago: string;
    public plazosPago: string;
    private _descuentoPP: number;
    public get DescuentoPP(): number {
        return this._descuentoPP;
    }
    public set DescuentoPP(value: number) {
        this._descuentoPP = value;
        for (const l of this.Lineas) {
            l.DescuentoPP = value;
        }
    }
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
    public EsPresupuesto: boolean;
    public notaEntrega: boolean;
    public usuario: string;
    
    public Lineas: Array<LineaVenta>;
}
