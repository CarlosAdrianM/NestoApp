import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-configuracion',
    templateUrl: './configuracion.component.html',
    styleUrls: ['./configuracion.component.scss'],
    standalone: false
})
export class Configuracion implements OnInit {

  constructor() { }

  public static URL_SERVIDOR: string = 'https://api.nuevavision.es';
  //public static URL_SERVIDOR: string = 'http://52.136.252.187:53364';
  public static get API_URL(): string { return Configuracion.URL_SERVIDOR + '/api'; }
  public static EMPRESA_POR_DEFECTO: string = '1';
  public static ALMACEN_POR_DEFECTO: string = 'ALG';
  public static NOMBRE_DOMINIO: string = 'NUEVAVISION';
  public static VENDEDOR_GENERAL: string = "NV";

  public static VERSION: string = "2.18.5";

  // Issue #88: versionCode mínimo del APK release (build.gradle) que incluye el intent-filter
  // msauth:// en AndroidManifest necesario para Outlook. Bundles web Live-Update con la feature
  // activa pero APK más antiguo verán el aviso de actualización en VersionNativoService.
  public static MIN_VERSION_CODE_OUTLOOK: number = 21802;
  public static MIN_VERSION_NAME_OUTLOOK: string = '2.18.2';

  ngOnInit() {}

}
