import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from './error-handler.service';
import { ProcessedApiError } from '../models/api-error.model';

// Lo que deja el interceptor (auth.interceptor) cuando la petición falla.
function procesado(original: HttpErrorResponse): ProcessedApiError {
  return {
    isBusinessError: false,
    isServerError: original.status >= 500,
    isCancelled: false,
    originalError: original,
    statusCode: original.status
  };
}

describe('ErrorHandlerService.extractErrorMessage sin mensaje del servidor (#231)', () => {
  const servicio = new ErrorHandlerService(null, null);
  const SIN_CONEXION = 'No se ha podido conectar con el servidor o ha tardado demasiado. Inténtelo de nuevo en un momento.';
  const NO_DISPONIBLE = 'El servidor no está disponible ahora mismo (puede que se esté actualizando). Inténtelo de nuevo en un par de minutos.';

  it('sin respuesta (status 0) dice que no se ha podido conectar', () => {
    const error = procesado(new HttpErrorResponse({ status: 0, url: 'https://api/PedidosVenta', error: new ProgressEvent('error') }));
    expect(servicio.extractErrorMessage(error)).toBe(SIN_CONEXION);
  });

  it('un timeout de RxJS dice que no se ha podido conectar', () => {
    const error = { name: 'TimeoutError', message: 'Timeout has occurred' };
    expect(servicio.extractErrorMessage(error)).toBe(SIN_CONEXION);
  });

  [502, 503, 504].forEach(status => {
    it(`un ${status} con el HTML de IIS dice que el servidor no está disponible`, () => {
      const error = procesado(new HttpErrorResponse({ status, url: 'https://api/PedidosVenta', error: '<html><body>Service Unavailable</body></html>' }));
      expect(servicio.extractErrorMessage(error)).toBe(NO_DISPONIBLE);
    });
  });

  it('un 503 sin envolver (directo de HttpClient) también', () => {
    const error = new HttpErrorResponse({ status: 503, url: 'https://api/x', error: null });
    expect(servicio.extractErrorMessage(error)).toBe(NO_DISPONIBLE);
  });

  it('si el servidor contesta con mensaje, se respeta aunque sea un 503', () => {
    const error = procesado(new HttpErrorResponse({ status: 503, url: 'https://api/x', error: { Message: 'Puede estar bloqueado por: Marta' } }));
    expect(servicio.extractErrorMessage(error)).toBe('Puede estar bloqueado por: Marta');
  });

  it('un 500 sin mensaje sigue con el genérico', () => {
    const error = procesado(new HttpErrorResponse({ status: 500, url: 'https://api/x', error: null }));
    expect(servicio.extractErrorMessage(error)).toBe('Ha ocurrido un error inesperado');
  });
});
