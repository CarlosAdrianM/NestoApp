import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Evento, ModalidadEventoCurso, modalidadesConImporte, plazasLibres, textoFormatoEvento, textoModalidadCurso, textoPlazas } from 'src/app/models/eventos.model';
import { EventosService } from '../inscribir-evento/eventos.service';
import { FirebaseAnalytics } from 'src/app/services/firebase-analytics.service';

/**
 * NestoApp#247 / NestoAPI#692: la ficha de solo lectura de un evento, que abre la push de anuncio
 * («Nuevo evento: …») para que el vendedor pueda ofrecérselo al cliente: título, fecha, hora, tienda u
 * online, ponente, plazas libres y modalidades con su importe.
 */
@Component({
  selector: 'app-evento',
  templateUrl: './evento.component.html',
  styleUrls: ['./evento.component.scss'],
  standalone: false
})
export class EventoComponent {
  public evento: Evento | null = null;
  public cargando = false;
  public mensaje = '';
  public readonly textoPlazas = textoPlazas;
  public readonly textoModalidad = textoModalidadCurso;

  constructor(private route: ActivatedRoute, private servicio: EventosService, private firebaseAnalytics: FirebaseAnalytics) {
    // Por queryParams y no por el snapshot: dos pushes seguidas de eventos distintos reutilizan la página.
    this.route.queryParams.subscribe(params => {
      const id = Number(params?.id);
      if (id) {
        this.cargar(id);
      }
    });
  }

  public cargar(id: number): void {
    this.cargando = true;
    this.mensaje = '';
    this.evento = null;
    this.servicio.leerEvento(id).subscribe({
      next: evento => {
        this.evento = evento;
        this.cargando = false;
        if (!evento) {
          this.mensaje = 'No se ha encontrado el evento.';
        } else {
          this.firebaseAnalytics.logEvent('evento_abrir', { evento: id });
        }
      },
      error: () => {
        this.cargando = false;
        this.mensaje = 'No se ha podido cargar el evento. Inténtelo otra vez en un rato.';
      }
    });
  }

  get textoFormato(): string {
    return textoFormatoEvento(this.evento?.Formato, this.evento?.Almacen);
  }

  get horario(): string {
    const inicio = (this.evento?.HoraInicio || '').trim();
    const fin = (this.evento?.HoraFin || '').trim();
    return inicio ? (fin ? `${inicio} - ${fin}` : inicio) : '';
  }

  get modalidades(): ModalidadEventoCurso[] {
    return this.evento ? modalidadesConImporte(this.evento) : [];
  }

  get sinPlazas(): boolean {
    return !!this.evento && plazasLibres(this.evento) === 0;
  }
}
