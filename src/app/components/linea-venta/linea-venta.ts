import { ParametrosIva } from 'src/app/models/parametros-iva.model';

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
            this._iva = linea.iva;
            this.oferta = linea.oferta;
            this.picking = linea.picking;
            this.PrecioUnitario = linea.PrecioUnitario;
            this.Producto = linea.Producto;
            this.texto = linea.texto;
            this.tipoLinea = linea.tipoLinea;
            this.Usuario = linea.usuario;
            this.vistoBueno = linea.vistoBueno;
            this.PorcentajeIva = linea.PorcentajeIva || 0;
            this.PorcentajeRecargoEquivalencia = linea.PorcentajeRecargoEquivalencia || 0;
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
            this.PorcentajeIva = 0;
            this.PorcentajeRecargoEquivalencia = 0;
        }
    }

    // Referencia a los parámetros de IVA del pedido (se asigna desde el pedido)
    public parametrosIva: ParametrosIva[] = [];

    public id: number;
    public almacen: string;
    public AplicarDescuento: boolean;
    public Cantidad: number;
    public delegacion: string;
    public DescuentoLinea: number;
    public DescuentoPP: number;
    public DescuentoProducto: number;
    public estado: number;
    public fechaEntrega: string;
    public formaVenta: string;

    private _iva: string;
    public get iva(): string {
        return this._iva;
    }
    public set iva(value: string) {
        this._iva = value;
        // Al cambiar el IVA, buscar el porcentaje en parametrosIva
        this.actualizarPorcentajeIva();
    }

    public oferta: number;
    public picking: number;
    public PrecioUnitario: number;
    public Producto: string;
    public texto: string;
    public tipoLinea: number;
    public Usuario: string;
    public vistoBueno: boolean;

    public PorcentajeIva: number;
    public PorcentajeRecargoEquivalencia: number;

    public get Bruto(): number {
        return this.PrecioUnitario * this.Cantidad;
    }

    public get BaseImponible(): number {
        let importeDescuento = this.redondea(this.Bruto * this.SumaDescuentos);
        return this.redondea(this.Bruto - importeDescuento);
    }
    public set BaseImponible(value: number) { } //para que no de error

    public get ImporteIva(): number {
        return this.redondea(this.BaseImponible * this.PorcentajeIva / 100);
    }
    public set ImporteIva(value: number) { } // para compatibilidad

    public get ImporteRecargoEquivalencia(): number {
        return this.redondea(this.BaseImponible * this.PorcentajeRecargoEquivalencia / 100);
    }

    public get Total(): number {
        return this.redondea(this.BaseImponible + this.ImporteIva + this.ImporteRecargoEquivalencia);
    }
    public set Total(value: number) { } // para compatibilidad

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
        // Copiar referencia a parámetros de IVA
        if (pedido.parametrosIva) {
            this.parametrosIva = pedido.parametrosIva;
            this.actualizarPorcentajeIva();
        }
    }

    public actualizarPorcentajeIva(): void {
        if (this.parametrosIva && this.parametrosIva.length > 0 && this._iva) {
            const parametro = this.parametrosIva.find(
                p => p.codigoIvaProducto.toLowerCase() === this._iva.toLowerCase()
            );
            if (parametro) {
                this.PorcentajeIva = parametro.porcentajeIvaProducto;
                this.PorcentajeRecargoEquivalencia = parametro.porcentajeIvaRecargoEquivalencia;
            }
        }
    }

    private redondea(value: number): number {
        return Number(Math.round(value * 100) / 100);
    }
}
