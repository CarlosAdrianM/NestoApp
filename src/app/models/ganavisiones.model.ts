export interface ProductosBonificablesResponse {
  GanavisionesDisponibles: number;
  BaseImponibleBonificable: number;
  Productos: ProductoBonificable[];
}

export interface ProductoBonificable {
  ProductoId: string;
  ProductoNombre: string;
  Ganavisiones: number;
  PVP: number;
  Iva: string;
  UrlFoto?: string;
  Stocks: StockAlmacen[];
  StockTotal: number;
}

export interface StockAlmacen {
  almacen: string;
  stock: number;
  cantidadDisponible: number;
}

export interface ProductoBonificadoConCantidad {
  ProductoId: string;
  Cantidad: number;
  EsBonificadoGanavisiones?: boolean;
}

export interface ValidarServirJuntoRequest {
  Almacen: string;
  ProductosBonificadosConCantidad: ProductoBonificadoConCantidad[];
  LineasPedido?: ProductoBonificadoConCantidad[];
  FormaPago?: string;
  PlazosPago?: string;
  CCC?: string;
  PeriodoFacturacion?: string;
  NotaEntrega?: boolean;
}

export interface ValidarServirJuntoResponse {
  PuedeDesmarcar: boolean;
  ProductosProblematicos: ProductoSinStock[];
  Mensaje: string | null;
  Aviso?: string | null;
}

export interface ProductoSinStock {
  ProductoId: string;
  ProductoNombre: string;
  AlmacenConStock: string | null;
}
