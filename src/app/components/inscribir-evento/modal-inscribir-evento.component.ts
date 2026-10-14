import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { FirebaseAnalytics } from 'src/app/services/firebase-analytics.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { Evento, FormaPagoInscripcion, InscripcionEvento, eventosInscribibles, seGeneraEnlace, textoPlazas } from 'src/app/models/eventos.model';
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
          <ion-item>
            <ion-label>Forma de pago</ion-label>
            <ion-select slot="end" aria-label="Forma de pago" interface="action-sheet" [cancelText]="'Cancelar'" [(ngModel)]="formaPago">
              <ion-select-option value="Tarjeta">Tarjeta</ion-select-option>
              <ion-select-option value="Transferencia">Transferencia</ion-select-option>
              <ion-select-option value="Efectivo">Efectivo</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item *ngIf="formaPago === 'Tarjeta'">
            <ion-label>Mandar enlace de pago</ion-label>
            <ion-toggle slot="end" aria-label="Mandar enlace de pago" [(ngModel)]="generarEnlace"></ion-toggle>
          </ion-item>
          <ion-item *ngIf="seGeneraEnlace">
            <ion-input label="Correo del cliente (opcional)" label-placement="stacked" type="email" [(ngModel)]="correo"></ion-input>
          </ion-item>
          <ion-item lines="none">
            <ion-label class="ion-text-wrap" color="medium" style="font-size: 0.85em;">
              La plaza queda reservada 7 días (o hasta el día del evento) mientras no se pague.
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
  styles: [`.enlace { word-break: break-all; font-size: 0.85em; }`],
  standalone: false
})
export class ModalInscribirEventoComponent implements OnInit {
  /** { empresa, cliente, contacto, nombre? } */
  cliente: any;
  correo: string = '';

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
    return seGeneraEnlace(this.formaPago, this.generarEnlace);
  }

  public async cargarEventos(): Promise<void> {
    this.cargando = true;
    this.mensaje = '';
    try {
      this.eventos = eventosInscribibles(await firstValueFrom(this.servicio.leerEventos(this.cliente.empresa.trim())));
      if (this.eventos.length === 0) {
        this.mensaje = 'No hay eventos próximos con plazas libres.';
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
        FormaPago: this.formaPago,
        GenerarEnlacePago: this.seGeneraEnlace,
        Correo: this.seGeneraEnlace && this.correo ? this.correo.trim() : undefined
      }));
      this.cargarInscripciones();
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
