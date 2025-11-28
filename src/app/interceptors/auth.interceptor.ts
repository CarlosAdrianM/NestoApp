import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { Storage } from '@ionic/storage';
import { Usuario } from '../models/Usuario';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';
import { ApiErrorResponse, ProcessedApiError } from '../models/api-error.model';
import { ErrorHandlerService } from '../services/error-handler.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private storage: Storage,
    private usuario: Usuario,
    private errorHandler: ErrorHandlerService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Solo interceptar peticiones a nuestra API
    if (!request.url.startsWith(Configuracion.URL_SERVIDOR)) {
      return next.handle(request);
    }

    return from(this.storage.get('id_token')).pipe(
      switchMap(token => {
        let clonedRequest = request;

        // Preparar headers adicionales
        const headers: { [key: string]: string } = {};

        // Añadir token de autorización si existe
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Añadir usuario en header personalizado para logging en NestoAPI
        if (this.usuario?.nombre) {
          headers['X-Usuario'] = this.usuario.nombre;
        }

        // Clonar la petición con los nuevos headers
        if (Object.keys(headers).length > 0) {
          clonedRequest = request.clone({
            setHeaders: headers
          });
        }

        return next.handle(clonedRequest).pipe(
          catchError((error: HttpErrorResponse) => {
            const processedError = this.processError(error);
            return throwError(processedError);
          })
        );
      })
    );
  }

  /**
   * Procesa un error HTTP y lo convierte en un ProcessedApiError estructurado
   */
  private processError(error: HttpErrorResponse): ProcessedApiError {
    const isBusinessError = error.status === 400 || error.status === 409;
    const isServerError = error.status >= 500;

    let apiError: ApiErrorResponse | undefined;

    // Verificar si es un error estructurado de NestoAPI
    if (this.errorHandler.isApiErrorResponse(error.error)) {
      apiError = error.error;
    }

    return {
      isBusinessError,
      isServerError,
      apiError,
      originalError: error,
      statusCode: error.status
    };
  }
}
