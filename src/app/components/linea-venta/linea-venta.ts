export class LineaVenta {
    constructor(linea?: any) {
        if (linea) {
            this.id = linea.id;
            this.almacen = linea.almacen;
            this.AplicarDescuento = linea.AplicarDescuento;
            this.Cantidad = linea.Cantidad;
            this.delegacion = linea.delegacion;
            this.DescuentoLinea = linea.DescuentoLinea;
            this.DescuentoPP = linea.DescuentoPP;
            this.DescuentoProducto = linea.DescuentoProducto;
            this.estado = linea.estado;
            this.fechaEntrega = linea.fechaEntrega;
            this.formaVenta = linea.formaVenta;
            this.iva = linea.iva;
            this.oferta = linea.oferta;
            this.picking = linea.picking;
            this.PrecioUnitario = linea.PrecioUnitario;
            this.Producto = linea.Producto;
            this.texto = linea.texto;
            this.tipoLinea = linea.tipoLinea;
            this.Usuario = linea.usuario;
            this.vistoBueno = linea.vistoBueno;
            this.ImporteIva = linea.ImporteIva;
            this.Total = linea.Total;
        } else {
            this.id = 0;
            this.AplicarDescuento = true;
            this.Cantidad = 1;
            this.DescuentoLinea = 0;
            this.DescuentoPP = 0;
            this.DescuentoProducto = 0;
            this.estado = 1;
            this.oferta = null;
            this.picking = 0;
            this.PrecioUnitario = 0;
            this.Producto = "";
            this.texto = "";
            this.tipoLinea = 1;
            this.vistoBueno = false;
            this.ImporteIva = 0;
            this.Total = 0;
        }
    }

    public id: number;
    public almacen: string;
    public AplicarDescuento: boolean;
    public Cantidad: number;
    public delegacion: string;
    public DescuentoLinea: number;
    public DescuentoPP: number;
    public DescuentoProducto: number;
    public estado: number;
    public fechaEntrega: Date;
    public formaVenta: string;
    public iva: string;
    public oferta: number;
    public picking: number;
    public PrecioUnitario: number;
    public Producto: string;
    public texto: string;
    public tipoLinea: number;
    public Usuario: string;
    public vistoBueno: boolean;
    public get Bruto(): number {
        return this.PrecioUnitario * this.Cantidad;
    }
    public get BaseImponible(): number {
        let importeDescuento = this.redondea(this.Bruto * this.SumaDescuentos);
        return this.Bruto - importeDescuento;
    }
    public set BaseImponible(value: number) {} //para que no de error
    public ImporteIva: number;
    public Total: number;
    public get SumaDescuentos(): number {
        return 1 - ((1 - this.DescuentoLinea) * (1 - this.DescuentoProducto) * (1 - this.DescuentoPP));
    }

    public copiarDatosPedido(pedido: any): void {
        this.almacen = pedido.Lineas[0].almacen;
        this.delegacion = pedido.Lineas[0].delegacion;
        this.fechaEntrega = pedido.Lineas[0].fechaEntrega;
        this.formaVenta = pedido.Lineas[0].formaVenta;
        this.iva = pedido.Lineas[0].iva;  
        this.estado = 1;
        this.picking = 0;  
        this.DescuentoPP = pedido.DescuentoPP;
    }

    private redondea(value) {
        return Number(Math.round(value * 100) / 100);
    }
}
