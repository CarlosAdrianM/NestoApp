import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { Usuario } from '../models/Usuario';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';
import { ApiErrorResponse, ProcessedApiError } from '../models/api-error.model';
import { ErrorHandlerService } from '../services/error-handler.service';
import { AuthService } from '../services/auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private usuario: Usuario,
    private errorHandler: ErrorHandlerService,
    private authService: AuthService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!request.url.startsWith(Configuracion.URL_SERVIDOR)) {
      return next.handle(request);
    }

    // /oauth/token nunca debe llevar Authorization (login y refresh son anónimos).
    // Excluirlo también evita recursión si el refresh devuelve 401.
    if (request.url.includes('/oauth/token')) {
      return next.handle(request);
    }

    return from(this.authService.getValidToken()).pipe(
      switchMap(token => {
        const clonedRequest = this.clonarConHeaders(request, token);
        return next.handle(clonedRequest).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
              return from(this.authService.refreshAccessToken()).pipe(
                switchMap(newToken => next.handle(this.clonarConHeaders(request, newToken))),
                catchError(() => throwError(this.processError(error)))
              );
            }
            return throwError(this.processError(error));
          })
        );
      })
    );
  }

  private clonarConHeaders(request: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
    const headers: { [key: string]: string } = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (this.usuario?.nombre) {
      headers['X-Usuario'] = this.usuario.nombre;
    }
    return Object.keys(headers).length > 0 ? request.clone({ setHeaders: headers }) : request;
  }

  private processError(error: HttpErrorResponse): ProcessedApiError {
    const isBusinessError = error.status === 400 || error.status === 409;
    const isServerError = error.status >= 500;

    let apiError: ApiErrorResponse | undefined;

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
