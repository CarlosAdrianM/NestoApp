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
  }
  
  export interface ResumenVentas {
    nombre: string;
    ventaAnnoActual: number;
    ventaAnnoAnterior: number;
    diferencia: number;
    ratio: number;
  }