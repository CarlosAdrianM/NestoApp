import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { ErroresService } from './errores.service';

/**
 * Issue #123: ErrorHandler global que reporta los errores no controlados a ELMAH
 * vía ErroresService. Usa Injector para resolver dependencias bajo demanda y evitar
 * ciclos en el bootstrap.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  constructor(private injector: Injector) { }

  handleError(error: any): void {
    try {
      console.error(error);
    } catch { }
    try {
      const erroresService = this.injector.get(ErroresService);
      const router = this.injector.get(Router, null);
      const contexto = router?.url;
      erroresService.reportar(error, contexto);
    } catch { }
  }
}
