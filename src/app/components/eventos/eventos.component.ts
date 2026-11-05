import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Evento, eventosProximos, plazasLibres, textoAforo, textoFormatoEvento } from 'src/app/models/eventos.model';
import { EventosService } from '../inscribir-evento/eventos.service';
import { FirebaseAnalytics } from 'src/app/services/firebase-analytics.service';

/**
 * NestoApp#268 (gemela de Nesto#619; Sancho, Novedades 1021): los próximos eventos con su fecha, tienda, aforo y
 * apuntados. Al tocar uno se abre su ficha (#247), con los inscritos y «Inscribir». Sin pasar lista ni pagos: eso sigue en Nesto.
 */
@Component({
  selector: 'app-eventos',
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.scss'],
  standalone: false
})
export class EventosComponent {
  public eventos: Evento[] = [];
  public cargando = false;
  public mensaje = '';
  public readonly textoAforo = textoAforo;

  constructor(private servicio: EventosService, private nav: NavController, private firebaseAnalytics: FirebaseAnalytics) { }

  ionViewWillEnter(): void {
    this.cargar();
  }

  public cargar(): void {
    this.cargando = true;
    this.mensaje = '';
    this.servicio.leerEventos('1').subscribe({
      next: eventos => {
        this.eventos = eventosProximos(eventos);
        this.cargando = false;
        if (this.eventos.length === 0) {
          this.mensaje = 'No hay eventos próximos.';
        }
        this.firebaseAnalytics.logEvent('eventos_abrir', { total: this.eventos.length });
      },
      error: () => {
        this.cargando = false;
        this.eventos = [];
        this.mensaje = 'No se han podido cargar los eventos. Inténtelo otra vez en un rato.';
      }
    });
  }

  public textoFormato(evento: Evento): string {
    return textoFormatoEvento(evento?.Formato, evento?.Almacen);
  }

  public completo(evento: Evento): boolean {
    return plazasLibres(evento) === 0;
  }

  public abrir(evento: Evento): void {
    this.nav.navigateForward('evento', { queryParams: { id: evento.Id } });
  }
}
