import { Observable } from 'rxjs';
import { RouterStateSnapshot } from '@angular/router';

export interface IDeactivatableComponent {
 /**
  * Issue #183: recibe el destino de la navegación, porque no toda desactivación de la ruta
  * es salir de la pantalla (entrar a una subpantalla que luego vuelve también la desactiva).
  */
 canDeactivate: (nextState?: RouterStateSnapshot) => Observable<boolean> | Promise<boolean> | boolean;
}
