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
  Bloqueado?: boolean;
  ImporteParaDesbloquear?: number;
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

export interface LineaPortesServirJunto {
  ProductoId: string;
  Almacen: string;
  Estado: number;
  Cantidad: number;
  BaseImponible: number;
}

export interface ValidarServirJuntoRequest {
  Almacen: string;
  /** NestoApp#174 / NestoAPI#482: modo al que se quiere pasar el pedido (2, 3 o 4), para que
   * los mensajes de denegación lo nombren. Opcional: sin él el servidor asume el 2. */
  ModoServicio?: number;
  ProductosBonificadosConCantidad: ProductoBonificadoConCantidad[];
  LineasPedido?: ProductoBonificadoConCantidad[];
  LineasParaPortes?: LineaPortesServirJunto[];
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
  BaseImponibleSinServirJunto?: number;
}

export interface ProductoSinStock {
  ProductoId: string;
  ProductoNombre: string;
  AlmacenConStock: string | null;
}

/**
 * NestoAPI#466 / NestoApp#171: grupos cuya base imponible genera Ganavisiones.
 * La lista de verdad es la del servidor (`GET api/Ganavisiones/GruposBonificables`),
 * que es la que valida el pedido al guardarlo; esto es solo el valor de reserva
 * para cuando la llamada aún no ha respondido o ha fallado.
 * La peluquería (PEL) quedó fuera el 09/09/26.
 */
export const GRUPOS_BONIFICABLES_POR_DEFECTO: string[] = ['COS', 'ACC'];
