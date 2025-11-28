import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AlertsService } from 'src/app/alerts.service';
import { AuthService } from 'src/app/auth.service';
import { Usuario } from 'src/app/models/Usuario';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';
import { Event } from '@microsoft/microsoft-graph-types';

@Injectable({
  providedIn: 'root'
})
export class RapportService {

  static ngInjectableDef = undefined;

  constructor(private http: HttpClient, 
    private usuario: Usuario, 
    private authService: AuthService,
    private alertsService: AlertsService) {    }

  private _baseUrl: string = Configuracion.API_URL + '/SeguimientosClientes';
  private _clientesUrl: string = Configuracion.API_URL + '/Clientes';

  public crearRapport(rapport: any): Observable<any> {
      let headers: any = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json');

      if (rapport.Id == 0) {
          return this.http.post(this._baseUrl, JSON.stringify(rapport), { headers: headers });
      } else {
          return this.http.put(this._baseUrl, JSON.stringify(rapport), { headers: headers });
      }
  }

  public getCliente(cliente: string, contacto: string): Observable<any> {
      let params: HttpParams = new HttpParams();
      params = params.append('empresa', Configuracion.EMPRESA_POR_DEFECTO);
      params = params.append('cliente', cliente);
      params = params.append('contacto', contacto);

      return this.http.get(this._clientesUrl, { params: params });
  }

  public dejarDeVisitar(rapport: any, vendedorEstetica: string, vendedorPeluqueria: string): Observable<any> {
      let headers: any = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json');
      let clienteCrear: any = {
          empresa: rapport.Empresa,
          cliente: rapport.Cliente,
          contacto: rapport.Contacto,
          usuario: rapport.Usuario
      }

      if (vendedorEstetica == this.usuario.vendedor) {
          clienteCrear.vendedorEstetica = Configuracion.VENDEDOR_GENERAL;
      }
      if (vendedorPeluqueria == this.usuario.vendedor) {
          clienteCrear.vendedorPeluqueria = Configuracion.VENDEDOR_GENERAL;
      }
      return this.http.put(this._clientesUrl+'/DejarDeVisitar', JSON.stringify(clienteCrear), { headers: headers });
  }

  async addEventToCalendar(newEvent: microsoftgraph.Event): Promise<void> {
    if (!this.authService.graphClient) {
      this.alertsService.addError('Graph client is not initialized.');
      return undefined;
    }

    try {
      // POST /me/events
      await this.authService.graphClient
        .api('/me/events')
        .post(newEvent);
    } catch (error) {
      throw Error(JSON.stringify(error, null, 2));
    }
  }

}
