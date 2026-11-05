import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { FirebaseAnalytics } from 'src/app/services/firebase-analytics.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { Evento, FormaPagoInscripcion, InscripcionEvento, ModalidadEventoCurso, eventosInscribibles, modalidadesInscripcion, seGeneraEnlace, textoModalidadCurso, textoPlazas } from 'src/app/models/eventos.model';
import { EventosService } from './eventos.service';

const esNoEncontrado = (error: any) => error?.status === 404 || error?.statusCode === 404;

/**
 * NestoApp#217 (NestoAPI#611, corte 1): inscribir al cliente en un evento futuro con plazas y mandarle
 * el enlace de pago. Enseña también sus inscripciones. Con una API sin inscripciones (404), lo dice.
 */
@Component({
  selector: 'modal-inscribir-evento',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Eventos</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cerrar()">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p *ngIf="cliente">{{ cliente.nombre || ('Cliente ' + cliente.cliente) }}</p>

      <ion-item *ngIf="cargando" lines="none">
        <ion-spinner slot="start" name="crescent"></ion-spinner>
        <ion-label>Cargando eventos…</ion-label>
      </ion-item>
      <ion-item *ngIf="mensaje" lines="none">
        <ion-label class="ion-text-wrap">{{ mensaje }}</ion-label>
      </ion-item>

      <ng-container *ngIf="!resultado">
        <ion-list *ngIf="eventos.length > 0">
          <ion-list-header><ion-label>Próximos eventos</ion-label></ion-list-header>
          <ion-item *ngFor="let evento of eventos" button detail="false" (click)="elegir(evento)" [color]="eventoElegido?.Id === evento.Id ? 'light' : ''">
            <ion-label class="ion-text-wrap">
              <h2>{{ evento.Titulo }}</h2>
              <p>{{ evento.Fecha | date:'EEEE dd/MM/yy HH:mm' }}<span *ngIf="evento.Lugar"> · {{ evento.Lugar }}</span></p>
              <p *ngIf="evento.ImporteSenal">Reserva: {{ evento.ImporteSenal | currency:'EUR' }}<span *ngIf="textoPlazas(evento)"> · {{ textoPlazas(evento) }}</span></p>
            </ion-label>
          </ion-item>
        </ion-list>

        <ion-list *ngIf="eventoElegido">
          <!-- NestoApp#217 (NestoAPI#690/#732): modalidad, también la plaza sin coste de los eventos gratuitos -->
          <ion-item *ngIf="modalidades.length > 1">
            <ion-label>Modalidad</ion-label>
            <ion-select slot="end" aria-label="Modalidad" interface="action-sheet" [cancelText]="'Cancelar'" [(ngModel)]="modalidad">
              <ion-select-option *ngFor="let m of modalidades" [value]="m.Modalidad">{{ textoModalidad(m) }}</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item *ngIf="modalidades.length === 1" lines="none">
            <ion-label class="ion-text-wrap">{{ textoModalidad(modalidades[0]) }}</ion-label>
          </ion-item>
          <!-- NestoApp#268 (NestoAPI#811): cuántas personas vienen -->
          <ion-item>
            <ion-label>Asistentes</ion-label>
            <ion-input slot="end" aria-label="Asistentes" type="number" inputmode="numeric" min="1" max="20" [(ngModel)]="asistentes" class="asistentes"></ion-input>
          </ion-item>
          <ion-item *ngIf="!esGratuita">
            <ion-label>Forma de pago</ion-label>
            <ion-select slot="end" aria-label="Forma de pago" interface="action-sheet" [cancelText]="'Cancelar'" [(ngModel)]="formaPago">
              <ion-select-option value="Tarjeta">Tarjeta</ion-select-option>
              <ion-select-option value="Transferencia">Transferencia</ion-select-option>
              <ion-select-option value="Efectivo">Efectivo</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item *ngIf="!esGratuita && formaPago === 'Tarjeta'">
            <ion-label>Mandar enlace de pago</ion-label>
            <ion-toggle slot="end" aria-label="Mandar enlace de pago" [(ngModel)]="generarEnlace"></ion-toggle>
          </ion-item>
          <ion-item *ngIf="seGeneraEnlace">
            <ion-input label="Correo del cliente (opcional)" label-placement="stacked" type="email" [(ngModel)]="correo"></ion-input>
          </ion-item>
          <ion-item lines="none" *ngIf="!esGratuita">
            <ion-label class="ion-text-wrap" color="medium" style="font-size: 0.85em;">
              La plaza queda reservada 7 días (o hasta el día del evento) mientras no se pague.
            </ion-label>
          </ion-item>
          <ion-item lines="none" *ngIf="esGratuita">
            <ion-label class="ion-text-wrap" color="medium" style="font-size: 0.85em;">
              Plaza sin coste: no se genera enlace de pago. Si el evento es «gratuito por compra», la API comprueba que el cliente haya comprado o pedido el producto.
            </ion-label>
          </ion-item>
          <ion-button expand="block" [disabled]="inscribiendo" (click)="inscribir()">Inscribir en «{{ eventoElegido.Titulo }}»</ion-button>
        </ion-list>
      </ng-container>

      <ion-card *ngIf="resultado" color="success">
        <ion-card-header>
          <ion-card-title>Inscrito en {{ resultado.Evento }}</ion-card-title>
          <ion-card-subtitle>{{ resultado.EstadoTexto }}<span *ngIf="resultado.FechaLimitePago"> · pagar hasta el {{ resultado.FechaLimitePago | date:'dd/MM/yy' }}</span></ion-card-subtitle>
        </ion-card-header>
        <ion-card-content *ngIf="resultado.UrlPago">
          <p>Enlace de pago:</p>
          <p class="enlace">{{ resultado.UrlPago }}</p>
          <ion-button size="small" fill="outline" color="light" (click)="copiar(resultado.UrlPago)">Copiar</ion-button>
          <ion-button size="small" fill="outline" color="light" (click)="mandarPorWhatsApp(resultado)">WhatsApp</ion-button>
        </ion-card-content>
      </ion-card>

      <ion-list *ngIf="inscripciones.length > 0">
        <ion-list-header><ion-label>Sus inscripciones</ion-label></ion-list-header>
        <ion-item *ngFor="let inscripcion of inscripciones">
          <ion-label class="ion-text-wrap">
            <h3>{{ inscripcion.Evento }}</h3>
            <p>{{ inscripcion.FechaEvento | date:'dd/MM/yy' }} · {{ inscripcion.EstadoTexto }}</p>
          </ion-label>
          <ion-button *ngIf="inscripcion.UrlPago" slot="end" fill="clear" (click)="copiar(inscripcion.UrlPago)" aria-label="Copiar el enlace de pago">
            <ion-icon slot="icon-only" name="copy-outline"></ion-icon>
          </ion-button>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  styles: [`.enlace { word-break: break-all; font-size: 0.85em; } .asistentes { max-width: 80px; text-align: right; }`],
  standalone: false
})
export class ModalInscribirEventoComponent implements OnInit {
  /** { empresa, cliente, contacto, nombre? } */
  cliente: any;
  correo: string = '';
  /** NestoApp#268: si se abre desde la ficha de un evento, ese ya elegido. */
  eventoId: number | null = null;
  /** NestoApp#268 (NestoAPI#811): cuántas personas vienen con la inscripción. */
  public asistentes: number = 1;
  /** NestoApp#217 (NestoAPI#690): Reembolsable, NoReembolsable o Gratuita; null = la API elige. */
  public modalidad: string | null = null;
  public readonly textoModalidad = textoModalidadCurso;

  public eventos: Evento[] = [];
  public inscripciones: InscripcionEvento[] = [];
  public eventoElegido: Evento | null = null;
  public formaPago: FormaPagoInscripcion = 'Tarjeta';
  public generarEnlace = true;
  public cargando = false;
  public inscribiendo = false;
  public mensaje = '';
  public resultado: InscripcionEvento | null = null;
  public readonly textoPlazas = textoPlazas;

  constructor(
    private modalCtrl: ModalController,
    private servicio: EventosService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private errorHandler: ErrorHandlerService,
    private firebaseAnalytics: FirebaseAnalytics
  ) { }

  async ngOnInit(): Promise<void> {
    await Promise.all([this.cargarEventos(), this.cargarInscripciones()]);
  }

  get seGeneraEnlace(): boolean {
    return !this.esGratuita && seGeneraEnlace(this.formaPago, this.generarEnlace);
  }

  get modalidades(): ModalidadEventoCurso[] {
    return modalidadesInscripcion(this.eventoElegido);
  }

  /** Plaza sin coste: ni forma de pago ni enlace. */
  get esGratuita(): boolean {
    return this.modalidad === 'Gratuita' || (!this.modalidad && this.modalidades.length === 1 && this.modalidades[0].Modalidad === 'Gratuita');
  }

  public async cargarEventos(): Promise<void> {
    this.cargando = true;
    this.mensaje = '';
    try {
      this.eventos = eventosInscribibles(await firstValueFrom(this.servicio.leerEventos(this.cliente.empresa.trim())));
      if (this.eventos.length === 0) {
        this.mensaje = 'No hay eventos próximos con plazas libres.';
      }
      // NestoApp#268: desde la ficha del evento, ese ya elegido (y solo ese en la lista).
      if (this.eventoId) {
        const elegido = this.eventos.find(e => +e.Id === +this.eventoId);
        if (elegido) {
          this.eventos = [elegido];
          this.elegir(elegido);
        } else {
          this.mensaje = 'Este evento ya no admite inscripciones (sin plazas, pasado o inactivo).';
          this.eventos = [];
        }
      }
    } catch (error) {
      this.eventos = [];
      this.mensaje = 'No se han podido cargar los eventos.';
    } finally {
      this.cargando = false;
    }
  }

  public async cargarInscripciones(): Promise<void> {
    this.inscripciones = await firstValueFrom(this.servicio.leerInscripcionesCliente(this.cliente.empresa, this.cliente.cliente)).catch(() => []);
  }

  public elegir(evento: Evento): void {
    this.eventoElegido = evento;
    // La modalidad por defecto: la única, o la primera de pago (como hace la API).
    const modalidades = modalidadesInscripcion(evento);
    this.modalidad = modalidades.length === 1 ? modalidades[0].Modalidad : (modalidades[0]?.Modalidad ?? null);
  }

  public async inscribir(): Promise<void> {
    if (!this.eventoElegido || this.inscribiendo) {
      return;
    }
    this.inscribiendo = true;
    this.firebaseAnalytics.logEvent('inscribir_evento', { evento: this.eventoElegido.Id, cliente: this.cliente.cliente, formaPago: this.formaPago });
    try {
      this.resultado = await firstValueFrom(this.servicio.inscribir(this.eventoElegido.Id, {
        Empresa: this.cliente.empresa?.trim(),
        Cliente: this.cliente.cliente?.trim(),
        Contacto: this.cliente.contacto?.toString().trim(),
        Origen: 'NestoApp',
        FormaPago: this.esGratuita ? undefined : this.formaPago,
        GenerarEnlacePago: this.seGeneraEnlace,
        Correo: this.seGeneraEnlace && this.correo ? this.correo.trim() : undefined,
        Modalidad: this.modalidad || undefined, // NestoApp#217
        Asistentes: Math.max(1, Math.floor(+this.asistentes || 1)) // NestoApp#268
      }));
      this.cargarInscripciones();
      // Sugerencia 776: avisos (no errores) al inscribir, p. ej. que a la ficha le falta el teléfono.
      const avisos = (this.resultado?.Avisos || []).filter(a => !!(a || '').trim());
      if (avisos.length) {
        const aviso = await this.alertCtrl.create({ header: 'Inscrito, pero ojo', message: avisos.join('\n\n'), buttons: ['Entendido'] });
        await aviso.present();
      }
    } catch (error) {
      const alerta = await this.alertCtrl.create({
        header: 'No se ha podido inscribir',
        message: esNoEncontrado(error)
          ? 'Las inscripciones a eventos todavía no están disponibles.'
          : this.errorHandler.extractErrorMessage(error),
        buttons: ['Ok']
      });
      await alerta.present();
    } finally {
      this.inscribiendo = false;
    }
  }

  public async copiar(texto: string): Promise<void> {
    let mensaje = 'Enlace copiado';
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      mensaje = 'No se ha podido copiar el enlace';
    }
    const toast = await this.toastCtrl.create({ message: mensaje, duration: 2000 });
    await toast.present();
  }

  public mandarPorWhatsApp(inscripcion: InscripcionEvento): void {
    const texto = `Para confirmar tu plaza en «${inscripcion.Evento}», puedes pagar aquí: ${inscripcion.UrlPago}`;
    window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_system');
  }

  public cerrar(): void {
    this.modalCtrl.dismiss({ inscrito: !!this.resultado });
  }
}
