export class LineaVenta {
    constructor(linea?: any) {
        if (linea) {
            this.id = linea.id;
            this.almacen = linea.almacen;
            this.aplicarDescuento = linea.aplicarDescuento;
            this.cantidad = linea.cantidad;
            this.delegacion = linea.delegacion;
            this.descuento = linea.descuento;
            this.estado = linea.estado;
            this.fechaEntrega = linea.fechaEntrega;
            this.formaVenta = linea.formaVenta;
            this.iva = linea.iva;
            this.oferta = linea.oferta;
            this.precio = linea.precio;
            this.producto = linea.producto;
            this.texto = linea.texto;
            this.tipoLinea = linea.tipoLinea;
            this.usuario = linea.usuario;
            this.vistoBueno = linea.vistoBueno;
            this.importeIva = linea.importeIva;
            this.total = linea.total;
        } else {
            this.id = 0;
            this.aplicarDescuento = true;
            this.cantidad = 1;
            this.descuento = 0;
            this.estado = 1;
            this.oferta = null;
            this.precio = 0;
            this.producto = "";
            this.texto = "";
            this.tipoLinea = 1;
            this.usuario = "";
            this.vistoBueno = false;
            this.importeIva = 0;
            this.total = 0;
        }
    }

    public id: number;
    public almacen: string;
    public aplicarDescuento: boolean;
    public cantidad: number;
    public delegacion: string;
    public descuento: number;
    public estado: number;
    public fechaEntrega: Date;
    public formaVenta: string;
    public iva: string;
    public oferta: number;
    public precio: number;
    public producto: string;
    public texto: string;
    public tipoLinea: number;
    public usuario: string;
    public vistoBueno: boolean;
    public get bruto(): number {
        return this.precio * this.cantidad;
    }
    public get baseImponible(): number {
        return this.bruto * (1 - this.descuento);
    }
    public set baseImponible(value: number) {} //para que no de error
    public importeIva: number;
    public total: number;

    public copiarDatosPedido(pedido: any): void {
        this.almacen = pedido.LineasPedido[0].almacen;
        this.delegacion = pedido.LineasPedido[0].delegacion;
        this.fechaEntrega = pedido.LineasPedido[0].fechaEntrega;
        this.formaVenta = pedido.LineasPedido[0].formaVenta;
        this.iva = pedido.LineasPedido[0].iva;    
    }
}
