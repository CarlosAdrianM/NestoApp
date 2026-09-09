/**
 * Issue #137 (NestoAPI#233): ofertas autorizadas que el vendedor puede consultar en modo
 * solo lectura. Son las tres modalidades que mantiene administración desde Nesto (WPF), tal
 * cual las devuelve la API (claves en PascalCase, como el resto de DTOs del servidor).
 */
export type TipoOfertaAutorizada = 'combinada' | 'familia' | 'escalonada';

export interface OfertaCombinada {
  Id: number;
  Empresa: string;
  Nombre: string;
  ImporteMinimo: number;
  FechaDesde?: string;
  FechaHasta?: string;
  RegalarMenorImporte: boolean;
  UnidadesRegaladas: number;
  Detalles: OfertaCombinadaDetalle[];
}

export interface OfertaCombinadaDetalle {
  Id: number;
  Producto: string;
  ProductoNombre: string;
  Familia: string;
  FiltroProducto: string;
  Grupo: string;
  Subgrupo: string;
  Cantidad: number;
  Precio: number;
  /** Las líneas con el mismo GrupoAlternativa son intercambiables ("elige 1"); null = obligatoria. */
  GrupoAlternativa?: number;
  /** Si es true, Cantidad es un máximo: el pedido puede llevar de 0 a Cantidad. */
  PermitirCantidadMenor: boolean;
}

export interface OfertaFamilia {
  NOrden: number;
  Empresa: string;
  Familia: string;
  FamiliaDescripcion: string;
  CantidadConPrecio: number;
  CantidadRegalo: number;
  FiltroProducto: string;
}

export interface OfertaEscalonada {
  Id: number;
  Empresa: string;
  Nombre: string;
  FechaDesde?: string;
  FechaHasta?: string;
  Productos: OfertaEscalonadaProducto[];
  Tramos: OfertaEscalonadaTramo[];
}

export interface OfertaEscalonadaProducto {
  Id: number;
  Producto: string;
  ProductoNombre: string;
  PrecioBase: number;
}

export interface OfertaEscalonadaTramo {
  Id: number;
  CantidadMinima: number;
  /** En tanto por uno (0,25 = 25 %). */
  Descuento: number;
}

export interface OfertasAutorizadas {
  combinadas: OfertaCombinada[];
  familias: OfertaFamilia[];
  escalonadas: OfertaEscalonada[];
}
