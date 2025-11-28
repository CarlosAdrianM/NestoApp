import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { ApiErrorResponse, ApiErrorCode, ErrorDetails, ProcessedApiError } from '../models/api-error.model';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  /**
   * Verifica si un error es una respuesta de error estructurada de NestoAPI
   */
  isApiErrorResponse(data: any): data is ApiErrorResponse {
    return data &&
           typeof data === 'object' &&
           data.error &&
           typeof data.error.code === 'string' &&
           typeof data.error.message === 'string';
  }

  /**
   * Maneja un error de la API y muestra el mensaje apropiado al usuario
   */
  async handleApiError(error: ProcessedApiError): Promise<void> {
    if (error.isBusinessError && error.apiError) {
      await this.handleBusinessError(error.apiError);
    } else if (error.isServerError) {
      await this.showToast('Error interno del servidor. Por favor, inténtelo más tarde.', 'danger');
    } else {
      await this.showToast('Error de conexión. Verifique su conexión a internet.', 'warning');
    }

    // Log estructurado del error
    this.logError(error);
  }

  /**
   * Maneja errores de negocio según su código
   */
  private async handleBusinessError(apiError: ApiErrorResponse): Promise<void> {
    const { code, message, details } = apiError.error;

    switch (code) {
      case ApiErrorCode.PEDIDO_VALIDACION_FALLO:
        await this.showValidationDialog(message, details);
        break;

      case ApiErrorCode.FACTURACION_IVA_FALTANTE:
        await this.showAlert('Error de Facturación', message, this.formatDetails(details));
        break;

      case ApiErrorCode.PEDIDO_CLIENTE_NO_EXISTE:
        await this.showAlert('Cliente no encontrado', message, this.formatDetails(details));
        break;

      case ApiErrorCode.PEDIDO_SIN_LINEAS:
        await this.showToast('No puedes crear un pedido vacío', 'warning');
        break;

      case ApiErrorCode.PEDIDO_DESCUENTO_EXCEDIDO:
        await this.showAlert('Descuento no permitido', message, this.formatDetails(details));
        break;

      case ApiErrorCode.PEDIDO_YA_PROCESADO:
        await this.showToast(message, 'warning');
        break;

      case ApiErrorCode.PEDIDO_ESTADO_INVALIDO:
        await this.showAlert('Estado inválido', message, this.formatDetails(details));
        break;

      default:
        await this.showToast(message, 'danger');
        break;
    }
  }

  /**
   * Muestra un diálogo de validación con opción de forzar la operación
   * Retorna true si el usuario decide continuar, false si cancela
   */
  async showValidationDialog(message: string, details?: ErrorDetails): Promise<boolean> {
    return new Promise(async (resolve) => {
      const motivos = details?.respuestaValidacion?.motivos || [];
      const motivosHtml = motivos.length > 0
        ? `<ul>${motivos.map(m => `<li>${m}</li>`).join('')}</ul>`
        : '';

      const alert = await this.alertCtrl.create({
        header: 'Advertencia de Validación',
        message: `${message}${motivosHtml}`,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => resolve(false)
          },
          {
            text: 'Continuar de todas formas',
            handler: () => resolve(true)
          }
        ]
      });

      await alert.present();
    });
  }

  /**
   * Muestra un alert con información detallada
   */
  async showAlert(header: string, message: string, subHeader?: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header,
      subHeader,
      message,
      buttons: ['Aceptar']
    });

    await alert.present();
  }

  /**
   * Muestra un toast con el mensaje
   */
  async showToast(message: string, color: 'success' | 'warning' | 'danger' = 'danger'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 4000,
      color,
      position: 'bottom'
    });

    await toast.present();
  }

  /**
   * Formatea los detalles del error para mostrar al usuario
   */
  private formatDetails(details?: ErrorDetails): string {
    if (!details) return '';

    const lines: string[] = [];
    if (details.pedido) lines.push(`Pedido: ${details.pedido}`);
    if (details.cliente) lines.push(`Cliente: ${details.cliente}`);
    if (details.usuario) lines.push(`Usuario: ${details.usuario}`);
    if (details.empresa) lines.push(`Empresa: ${details.empresa}`);
    if (details.factura) lines.push(`Factura: ${details.factura}`);

    return lines.join(' | ');
  }

  /**
   * Registra el error en consola con formato estructurado
   */
  private logError(error: ProcessedApiError): void {
    if (error.apiError) {
      console.error(`[API Error ${error.apiError.error.code}]`, {
        message: error.apiError.error.message,
        timestamp: error.apiError.error.timestamp,
        details: error.apiError.error.details,
        statusCode: error.statusCode
      });
    } else {
      console.error('[HTTP Error]', {
        statusCode: error.statusCode,
        error: error.originalError
      });
    }
  }

  /**
   * Extrae el mensaje de error de cualquier tipo de error
   * Soporta tanto el nuevo formato estructurado como el formato antiguo de NestoAPI
   */
  extractErrorMessage(error: any): string {
    // Nuevo formato estructurado (ProcessedApiError con apiError)
    if (error?.apiError?.error?.message) {
      return error.apiError.error.message;
    }

    // Formato antiguo de NestoAPI (ExceptionMessage) - acceso via originalError
    if (error?.originalError?.error?.ExceptionMessage) {
      return error.originalError.error.ExceptionMessage;
    }
    if (error?.originalError?.error?.Message) {
      return error.originalError.error.Message;
    }

    // Acceso directo al error HTTP (sin wrapper ProcessedApiError)
    if (error?.error?.ExceptionMessage) {
      return error.error.ExceptionMessage;
    }
    if (error?.error?.Message) {
      return error.error.Message;
    }

    // Otros formatos comunes
    if (error?.error?.error?.message) {
      return error.error.error.message;
    }
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.ExceptionMessage) {
      return error.ExceptionMessage;
    }
    if (error?.Message) {
      return error.Message;
    }
    if (error?.message) {
      return error.message;
    }

    return 'Ha ocurrido un error inesperado';
  }
}
