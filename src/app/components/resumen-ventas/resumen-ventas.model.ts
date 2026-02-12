// resumen-ventas.model.ts
export interface ResumenVentasResponse {
    FechaDesdeActual: string;
    FechaHastaActual: string;
    FechaDesdeAnterior: string;
    FechaHastaAnterior: string;
    Datos: ResumenVentasItem[];
  }

  export interface ResumenVentasItem {
    Nombre: string;
    VentaAnnoActual: number;
    VentaAnnoAnterior: number;
    UnidadesAnnoActual: number;
    UnidadesAnnoAnterior: number;
  }

  export interface ResumenVentas {
    nombre: string;
    ventaAnnoActual: number;
    ventaAnnoAnterior: number;
    diferencia: number;
    ratio: number;
    unidadesAnnoActual: number;
    unidadesAnnoAnterior: number;
  }

  // Interfaces para detalle por producto
  export interface DetalleProductoItem {
    Numero: string;
    Nombre: string;
    UnidadMedida: string;
    Tamanno: number;
    Familia: string;
    VentaAnnoActual: number;
    VentaAnnoAnterior: number;
    UnidadesAnnoActual: number;
    UnidadesAnnoAnterior: number;
    FechaUltimaCompra: string | null;
  }

  export interface DetalleProductoResponse {
    Datos: DetalleProductoItem[];
  }

  export interface DetalleProducto {
    numero: string;
    nombre: string;
    unidadMedida: string;
    tamanno: number;
    familia: string;
    ventaAnnoActual: number;
    ventaAnnoAnterior: number;
    unidadesAnnoActual: number;
    unidadesAnnoAnterior: number;
    diferencia: number;
    ratio: number;
    diferenciaUnidades: number;
    fechaUltimaCompra: string | null;
  }
