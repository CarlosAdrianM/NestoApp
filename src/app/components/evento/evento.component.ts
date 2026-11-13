import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Evento, InscripcionEvento, ModalidadEventoCurso, inscripcionesVisibles, modalidadesConImporte, ocupaPlaza, textoApuntados, plazasLibres, textoAforo, textoAsistentesExtra, textoFormatoEvento, textoModalidadCurso, textoPlazas } from 'src/app/models/eventos.model';
import { EventosService } from '../inscribir-evento/eventos.service';
import { FirebaseAnalytics } from 'src/app/services/firebase-analytics.service';
import { ModalElegirClienteComponent } from '../pedido-venta/modal-elegir-cliente.component';
import { ModalInscribirEventoComponent } from '../inscribir-evento/modal-inscribir-evento.component';

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
  public readonly textoAforo = textoAforo;
  public readonly asistentesExtra = textoAsistentesExtra;
  public readonly ocupaPlaza = ocupaPlaza;
  // NestoApp#268 (Nesto#619): los inscritos, con «Solo mis clientes» marcado para el vendedor.
  public inscripciones: InscripcionEvento[] = [];
  public cargandoInscripciones = false;
  public soloMisClientes = true;

  constructor(private route: ActivatedRoute, private servicio: EventosService, private firebaseAnalytics: FirebaseAnalytics,
    private modalCtrl?: ModalController) {
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
          this.cargarInscripciones();
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

  /** NestoApp#268: los inscritos del evento (una API anterior o sin permiso: lista vacía, sin ruido). */
  public cargarInscripciones(): void {
    if (!this.evento) {
      return;
    }
    this.cargandoInscripciones = true;
    this.servicio.leerInscripcionesEvento(this.evento.Id).subscribe({
      next: inscripciones => {
        this.inscripciones = inscripciones || [];
        this.cargandoInscripciones = false;
      },
      error: () => {
        this.inscripciones = [];
        this.cargandoInscripciones = false;
      }
    });
  }

  get inscripcionesVisibles(): InscripcionEvento[] {
    return inscripcionesVisibles(this.inscripciones, this.soloMisClientes);
  }

  /** Hay dato de «mis clientes»: el filtro tiene sentido. */
  get puedeFiltrarMisClientes(): boolean {
    return this.inscripciones.some(i => i.EsDeMisClientes !== null && i.EsDeMisClientes !== undefined);
  }

  /** «3 personas apuntadas · 1 caducada · 2 inscripciones de mis clientes» (#278: solo cuentan las que ocupan plaza). */
  get resumenInscritos(): string {
    const texto = textoApuntados(this.inscripciones);
    if (!this.puedeFiltrarMisClientes) {
      return texto;
    }
    const mios = this.inscripciones.filter(i => i.EsDeMisClientes === true && ocupaPlaza(i)).length;
    return `${texto} · ${mios} ${mios === 1 ? 'inscripción de mis clientes' : 'inscripciones de mis clientes'}`;
  }

  /**
   * NestoApp#268 / #217 (NestoAPI#741): inscribir a un cliente (de los suyos; el jefe de equipo, a los de su equipo): se elige
   * el cliente con el buscador de siempre y se abre la inscripción ya en este evento. Si no es suyo, la API contesta 403 de usted
   * y se enseña tal cual.
   */
  public async inscribirCliente(): Promise<void> {
    if (!this.evento || !this.modalCtrl) {
      return;
    }
    const elegir = await this.modalCtrl.create({ component: ModalElegirClienteComponent, componentProps: { titulo: 'Inscribir a…' } });
    await elegir.present();
    const { data: cliente, role } = await elegir.onDidDismiss();
    if (role !== 'elegido' || !cliente) {
      return;
    }
    this.firebaseAnalytics.logEvent('evento_inscribir_cliente', { evento: this.evento.Id, cliente: cliente.cliente });
    const inscribir = await this.modalCtrl.create({
      component: ModalInscribirEventoComponent,
      componentProps: { cliente: { empresa: cliente.empresa || '1', cliente: cliente.cliente, contacto: cliente.contacto, nombre: cliente.nombre }, eventoId: this.evento.Id }
    });
    await inscribir.present();
    const resultado = await inscribir.onDidDismiss();
    if (resultado?.data?.inscrito) {
      this.cargar(this.evento.Id); // plazas y lista al día
    }
  }
}
