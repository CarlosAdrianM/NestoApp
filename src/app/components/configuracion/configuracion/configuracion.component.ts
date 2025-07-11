import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.scss'],
})
export class Configuracion implements OnInit {

  constructor() { }

  public static URL_SERVIDOR: string = 'https://api.nuevavision.es';
  //public static URL_SERVIDOR: string = 'http://52.136.252.187:53364';
  public static API_URL: string = Configuracion.URL_SERVIDOR + '/api';
  public static EMPRESA_POR_DEFECTO: string = '1';
  public static ALMACEN_POR_DEFECTO: string = 'ALG';
  public static NOMBRE_DOMINIO: string = 'NUEVAVISION';
  public static VENDEDOR_GENERAL: string = "NV";

  public static VERSION: string = "2.7.1";

  ngOnInit() {}

}
