import { LineaVenta } from '../linea-venta/linea-venta';
import { ParametrosIva } from 'src/app/models/parametros-iva.model';

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
    // NestoApp#140 / NestoAPI#253: avisar por correo con el importe cuando el pedido coja picking.
    public avisarConImporteAlCogerPicking: boolean;
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
    /** NestoApp#174 / NestoAPI#482: modo de servicio (1..4). La API lo devuelve siempre al
     * leer; un pedido viejo sin él enseña el derivado de servirJunto. */
    public modoServicio: number;
    /** NestoApp#197 / NestoAPI#542: modo de facturación (1..3). La API lo devuelve siempre al leer;
     * al guardar se manda null si el vendedor no lo ha tocado (ver modos-facturacion.model). */
    public modoFacturacion: number | null;
    /** NestoApp#197: en una nota de entrega creada por la API, el pedido y el albarán de los que sale. */
    public pedidoOrigen?: number | null;
    public albaranOrigen?: number | null;
    public EsPresupuesto: boolean;
    public notaEntrega: boolean;
    public usuario: string;
    public suPedido: string;
    public noCobrarComisionReembolso: boolean;

    public Lineas: Array<LineaVenta>;

    // Parámetros de IVA cargados para este pedido
    public parametrosIva: ParametrosIva[] = [];
}
