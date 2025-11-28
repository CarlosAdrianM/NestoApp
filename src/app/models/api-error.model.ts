/**
 * Modelo para errores estructurados de NestoAPI
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    timestamp: string;
    details?: ErrorDetails;
    stackTrace?: string;      // Solo en desarrollo
    innerException?: any;     // Solo en desarrollo
  };
}

export interface ErrorDetails {
  empresa?: string;
  pedido?: number;
  cliente?: string;
  usuario?: string;
  factura?: string;
  respuestaValidacion?: RespuestaValidacion;
  [key: string]: any;  // Datos adicionales específicos del contexto
}

export interface RespuestaValidacion {
  motivos?: string[];
  autorizado?: boolean;
  requiereConfirmacion?: boolean;
}

/**
 * Códigos de error conocidos de NestoAPI
 */
export enum ApiErrorCode {
  // Facturación
  FACTURACION_IVA_FALTANTE = 'FACTURACION_IVA_FALTANTE',
  FACTURACION_SIN_LINEAS = 'FACTURACION_SIN_LINEAS',
  FACTURACION_STORED_PROCEDURE_ERROR = 'FACTURACION_STORED_PROCEDURE_ERROR',
  FACTURACION_SERIE_INVALIDA = 'FACTURACION_SERIE_INVALIDA',

  // Pedidos
  PEDIDO_VALIDACION_FALLO = 'PEDIDO_VALIDACION_FALLO',
  PEDIDO_INVALIDO = 'PEDIDO_INVALIDO',
  PEDIDO_SIN_LINEAS = 'PEDIDO_SIN_LINEAS',
  PEDIDO_CLIENTE_NO_EXISTE = 'PEDIDO_CLIENTE_NO_EXISTE',
  PEDIDO_ESTADO_INVALIDO = 'PEDIDO_ESTADO_INVALIDO',
  PEDIDO_DESCUENTO_EXCEDIDO = 'PEDIDO_DESCUENTO_EXCEDIDO',
  PEDIDO_YA_PROCESADO = 'PEDIDO_YA_PROCESADO',

  // Traspasos
  TRASPASO_CLIENTE_ERROR = 'TRASPASO_CLIENTE_ERROR',
  TRASPASO_PRODUCTO_ERROR = 'TRASPASO_PRODUCTO_ERROR',
  TRASPASO_CUENTA_CONTABLE_ERROR = 'TRASPASO_CUENTA_CONTABLE_ERROR',

  // Genéricos
  BUSINESS_ERROR = 'BUSINESS_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

/**
 * Wrapper de error procesado por el interceptor
 */
export interface ProcessedApiError {
  isBusinessError: boolean;
  isServerError: boolean;
  apiError?: ApiErrorResponse;
  originalError: any;
  statusCode: number;
}
