import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Usuario } from 'src/app/models/Usuario';
import { EnviosAgenciasService } from 'src/app/services/envios-agencias.service';
import { FirebaseAnalytics } from 'src/app/services/firebase-analytics.service';
import { EnvioDevuelto, enviosDevueltosVisibles, estaDecidido, textoEstadoEnvioDevuelto } from 'src/app/models/envio-devuelto.model';

/**
 * NestoApp#267 (NestoAPI#699): los envíos devueltos o con incidencia de los últimos 60 días, los del vendedor primero
 * («Solo los míos», por el vendedor del envío; la API lista todos los de la empresa). Los sin decidir, arriba.
 */
@Component({
  selector: 'app-envios-devueltos',
  templateUrl: './envios-devueltos.component.html',
  styleUrls: ['./envios-devueltos.component.scss'],
  standalone: false
})
export class EnviosDevueltosComponent {
  public envios: EnvioDevuelto[] = [];
  public cargando = false;
  public mensaje = '';
  public soloMios = true;
  public readonly textoEstado = textoEstadoEnvioDevuelto;
  public readonly decidido = estaDecidido;

  constructor(private servicio: EnviosAgenciasService, private usuario: Usuario, private nav: NavController, private firebaseAnalytics: FirebaseAnalytics) {
    this.soloMios = this.tieneVendedor;
  }

  ionViewWillEnter(): void {
    this.cargar();
  }

  get tieneVendedor(): boolean {
    const vendedor = (this.usuario?.vendedor || '').trim();
    return !!vendedor && vendedor !== 'Sin Vendedor';
  }

  get visibles(): EnvioDevuelto[] {
    return enviosDevueltosVisibles(this.envios, this.tieneVendedor ? this.usuario.vendedor : null, this.soloMios);
  }

  public cargar(): void {
    this.cargando = true;
    this.mensaje = '';
    this.servicio.leerDevueltos().subscribe({
      next: envios => {
        this.envios = envios || [];
        this.cargando = false;
        this.firebaseAnalytics.logEvent('envios_devueltos_abrir', { total: this.envios.length });
      },
      error: error => {
        this.cargando = false;
        this.envios = [];
        this.mensaje = (error?.status === 404 || error?.statusCode === 404)
          ? 'Los envíos devueltos todavía no están disponibles en el servidor.'
          : 'No se han podido cargar los envíos devueltos.';
      }
    });
  }

  public abrir(envio: EnvioDevuelto): void {
    this.nav.navigateForward('envio-devuelto', { queryParams: { empresa: envio.Empresa || '1', envio: envio.Numero } });
  }
}
