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

export interface ValidarServirJuntoRequest {
  Almacen: string;
  ProductosBonificados: string[];
}

export interface ValidarServirJuntoResponse {
  PuedeDesmarcar: boolean;
  ProductosProblematicos: ProductoSinStock[];
  Mensaje: string | null;
}

export interface ProductoSinStock {
  ProductoId: string;
  ProductoNombre: string;
  AlmacenConStock: string | null;
}
