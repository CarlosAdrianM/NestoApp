export declare class LineaVenta {
    constructor(linea?: any);
    id: number;
    almacen: string;
    aplicarDescuento: boolean;
    cantidad: number;
    delegacion: string;
    descuento: number;
    descuentoProducto: number;
    estado: number;
    fechaEntrega: Date;
    formaVenta: string;
    iva: string;
    oferta: number;
    picking: number;
    precio: number;
    producto: string;
    texto: string;
    tipoLinea: number;
    usuario: string;
    vistoBueno: boolean;
    readonly bruto: number;
    baseImponible: number;
    importeIva: number;
    total: number;
    readonly sumaDescuentos: number;
    copiarDatosPedido(pedido: any): void;
}
