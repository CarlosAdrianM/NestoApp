import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { Observable, firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';
import { ProductoPorCodigoBarras, esCodigoBarras, textoSinProductoCodigoBarras } from '../models/codigo-barras.model';

/**
 * NestoApp#262 (Nesto#582 / NestoAPI#605): donde el vendedor busca un producto, un código de barras (tecleado o
 * pegado del lector) se resuelve a la referencia. Uno → se abre; varios → se elige; ninguno → aviso.
 */
@Injectable({
  providedIn: 'root'
})
export class CodigosBarrasService {
  constructor(private http: HttpClient, private actionSheetCtrl: ActionSheetController, private alertCtrl: AlertController) { }

  public esCodigoBarras(texto: string): boolean {
    return esCodigoBarras(texto);
  }

  public buscar(codigo: string, empresa: string = Configuracion.EMPRESA_POR_DEFECTO): Observable<ProductoPorCodigoBarras[]> {
    let params = new HttpParams();
    params = params.append('codigo', (codigo || '').toString().replace(/\s/g, ''));
    params = params.append('empresa', empresa);
    return this.http.get<ProductoPorCodigoBarras[]>(`${Configuracion.API_URL}/Productos/PorCodigoBarras`, { params }).pipe(
      catchError(() => of([]))
    );
  }

  /**
   * La referencia del producto con ese código: la única, la que elija el vendedor si hay varias, o null si no hay
   * ninguna (se avisa) o cancela.
   */
  public async resolverProducto(codigo: string): Promise<string | null> {
    const productos = (await firstValueFrom(this.buscar(codigo))) || [];
    if (productos.length === 0) {
      const alert = await this.alertCtrl.create({ header: 'Código de barras', message: textoSinProductoCodigoBarras(codigo), buttons: ['Ok'] });
      await alert.present();
      return null;
    }
    if (productos.length === 1) {
      return (productos[0].Producto || '').trim() || null;
    }
    return new Promise<string | null>(async resolve => {
      const hoja = await this.actionSheetCtrl.create({
        header: `Varios productos tienen el código ${(codigo || '').trim()}`,
        buttons: [
          ...productos.map(p => ({
            text: `${(p.Producto || '').trim()} · ${(p.Nombre || '').trim()}${p.Cantidad > 1 ? ` (caja de ${p.Cantidad})` : ''}`,
            handler: () => { resolve((p.Producto || '').trim()); }
          })),
          { text: 'Cancelar', role: 'cancel', handler: () => { resolve(null); } }
        ]
      });
      await hoja.present();
    });
  }
}
