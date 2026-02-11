/**
 * Modelos para borradores de PlantillaVenta
 * Los nombres de campos deben coincidir con Nesto para compatibilidad JSON
 * Usamos camelCase - el deserializador de Nesto debe configurarse para aceptarlo
 */

/**
 * Línea de producto en la plantilla de venta
 * Campos idénticos a LineaPlantillaVenta de Nesto (camelCase)
 */
export interface LineaPlantillaVenta {
  producto: string;
  texto: string;
  cantidad: number;
  cantidadOferta: number;
  precio: number;
  descuento: number;
  aplicarDescuento: boolean;
  iva: string;
  grupo?: string;               // Para Ganavisiones (COS, ACC, PEL)
  familia?: string;
  subGrupo?: string;
  tamanno?: number;
  unidadMedida?: string;
  urlImagen?: string;
  aplicarDescuentoFicha?: boolean;
  stock?: number;
  cantidadDisponible?: number;
}

/**
 * Línea de regalo (Ganavisiones)
 * Campos idénticos a LineaRegalo de Nesto (camelCase)
 */
export interface LineaRegalo {
  producto: string;
  texto: string;
  precio: number;
  ganavisiones: number;
  iva: string;
  cantidad: number;
  urlImagen?: string;
}

/**
 * Borrador completo de PlantillaVenta
 * Campos idénticos a BorradorPlantillaVenta de Nesto (camelCase)
 */
export interface BorradorPlantillaVenta {
  // Identificación
  id: string;
  fechaCreacion: string;         // ISO 8601
  usuario: string;
  mensajeError?: string;         // Si se guardó por error

  // Datos del cliente
  empresa: string;
  cliente: string;
  contacto: string;              // Dirección de entrega
  nombreCliente: string;

  // Líneas
  lineasProducto: LineaPlantillaVenta[];
  lineasRegalo: LineaRegalo[];

  // Configuración
  comentarioRuta?: string;
  esPresupuesto: boolean;
  formaVenta?: number;           // 1=Directa, 2=Teléfono, >2=Otras
  formaVentaOtrasCodigo?: string;
  formaPago: string;
  plazosPago: string;

  // Entrega
  fechaEntrega: string;
  almacenCodigo: string;
  mantenerJunto: boolean;
  servirJunto: boolean;
  comentarioPicking?: string;

  // Total
  total: number;

  // Campos específicos NestoApp
  servirPorGlovo?: boolean;
  mandarCobroTarjeta?: boolean;
  cobroTarjetaCorreo?: string;
  cobroTarjetaMovil?: string;
}

/**
 * Metadatos de borrador para listar sin cargar todo el contenido
 * Uso interno de NestoApp
 */
export interface BorradorMetadata {
  id: string;
  fechaCreacion: string;
  nombreCliente: string;
  cliente: string;
  totalLineasProducto: number;
  totalLineasRegalo: number;
  total: number;
  mensajeError?: string;
}
