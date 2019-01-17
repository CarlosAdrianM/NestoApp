var LineaVenta = /** @class */ (function () {
    function LineaVenta(linea) {
        if (linea) {
            this.id = linea.id;
            this.almacen = linea.almacen;
            this.aplicarDescuento = linea.aplicarDescuento;
            this.cantidad = linea.cantidad;
            this.delegacion = linea.delegacion;
            this.descuento = linea.descuento;
            this.descuentoProducto = linea.descuentoProducto;
            this.estado = linea.estado;
            this.fechaEntrega = linea.fechaEntrega;
            this.formaVenta = linea.formaVenta;
            this.iva = linea.iva;
            this.oferta = linea.oferta;
            this.picking = linea.picking;
            this.precio = linea.precio;
            this.producto = linea.producto;
            this.texto = linea.texto;
            this.tipoLinea = linea.tipoLinea;
            this.usuario = linea.usuario;
            this.vistoBueno = linea.vistoBueno;
            this.importeIva = linea.importeIva;
            this.total = linea.total;
        }
        else {
            this.id = 0;
            this.aplicarDescuento = true;
            this.cantidad = 1;
            this.descuento = 0;
            this.descuentoProducto = 0;
            this.estado = 1;
            this.oferta = null;
            this.picking = 0;
            this.precio = 0;
            this.producto = "";
            this.texto = "";
            this.tipoLinea = 1;
            this.vistoBueno = false;
            this.importeIva = 0;
            this.total = 0;
        }
    }
    Object.defineProperty(LineaVenta.prototype, "bruto", {
        get: function () {
            return this.precio * this.cantidad;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LineaVenta.prototype, "baseImponible", {
        get: function () {
            return this.bruto * (1 - this.sumaDescuentos);
        },
        set: function (value) { } //para que no de error
        ,
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LineaVenta.prototype, "sumaDescuentos", {
        get: function () {
            return 1 - ((1 - this.descuento) * (1 - this.descuentoProducto));
        },
        enumerable: true,
        configurable: true
    });
    LineaVenta.prototype.copiarDatosPedido = function (pedido) {
        this.almacen = pedido.LineasPedido[0].almacen;
        this.delegacion = pedido.LineasPedido[0].delegacion;
        this.fechaEntrega = pedido.LineasPedido[0].fechaEntrega;
        this.formaVenta = pedido.LineasPedido[0].formaVenta;
        this.iva = pedido.LineasPedido[0].iva;
        this.estado = 1;
        this.picking = 0;
    };
    return LineaVenta;
}());
export { LineaVenta };
//# sourceMappingURL=LineaVenta.js.map