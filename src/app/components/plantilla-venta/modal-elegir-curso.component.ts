import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { EventoCurso, ModalidadEventoCurso, textoFormatoEvento, textoModalidadCurso, textoPlazasLibres } from 'src/app/models/eventos.model';

/**
 * NestoApp#244 / NestoAPI#691 (Nesto#543): al meter un curso en la plantilla se elige el evento (si hay
 * varios futuros; con uno solo sale ya elegido) y siempre la modalidad (nombre e importe). La línea del
 * curso lleva el importe de la modalidad y no deja tocar precio ni descuentos.
 */
@Component({
  selector: 'modal-elegir-curso',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Curso</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cancelar()">Cancelar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <h2 class="titulo-curso">{{ titulo }}</h2>

      <ion-list>
        <ion-list-header><ion-label>{{ eventos.length === 1 ? 'Evento' : 'Elija el evento' }}</ion-label></ion-list-header>
        <ion-item *ngFor="let evento of eventos" button detail="false" (click)="elegirEvento(evento)" [color]="eventoElegido?.Id === evento.Id ? 'light' : ''">
          <ion-icon slot="start" [name]="eventoElegido?.Id === evento.Id ? 'radio-button-on-outline' : 'radio-button-off-outline'"></ion-icon>
          <ion-label class="ion-text-wrap">
            <h3>{{ evento.Fecha | date:'EEEE dd/MM/yyyy' }}<span *ngIf="evento.HoraInicio"> · {{ evento.HoraInicio }}</span></h3>
            <p>{{ textoFormato(evento) }} · {{ textoPlazas(evento) }}</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <ion-list *ngIf="eventoElegido">
        <ion-list-header><ion-label>Modalidad</ion-label></ion-list-header>
        <ion-item *ngFor="let modalidad of eventoElegido.Modalidades" button detail="false" (click)="elegirModalidad(modalidad)" [color]="modalidadElegida?.Modalidad === modalidad.Modalidad ? 'light' : ''">
          <ion-icon slot="start" [name]="modalidadElegida?.Modalidad === modalidad.Modalidad ? 'radio-button-on-outline' : 'radio-button-off-outline'"></ion-icon>
          <ion-label class="ion-text-wrap">{{ textoModalidad(modalidad) }}</ion-label>
        </ion-item>
        <ion-item lines="none" *ngIf="!eventoElegido.Modalidades?.length">
          <ion-label class="ion-text-wrap" color="medium">Este evento no tiene ninguna modalidad que se pueda vender.</ion-label>
        </ion-item>
      </ion-list>

      <ion-item lines="none">
        <ion-label class="ion-text-wrap" color="medium" style="font-size: 0.85em;">
          El curso va en un pedido aparte con prepago y no cuenta para portes, Ganavisiones ni ofertas del pedido de productos.
        </ion-label>
      </ion-item>

      <ion-button expand="block" [disabled]="!sePuedeAceptar" (click)="aceptar()">Añadir el curso al pedido</ion-button>
      <ion-button expand="block" fill="clear" color="danger" *ngIf="eventoId" (click)="quitar()">Quitar el curso del pedido</ion-button>
    </ion-content>
  `,
  styles: [`.titulo-curso { font-size: 1.1em; margin: 0 0 8px 0; }`],
  standalone: false
})
export class ModalElegirCursoComponent implements OnInit {
  @Input() titulo: string = '';
  @Input() eventos: EventoCurso[] = [];
  /** Lo que ya tenía la línea (al volver a tocarla). */
  @Input() eventoId: number | null = null;
  @Input() modalidad: string | null = null;

  public eventoElegido: EventoCurso | null = null;
  public modalidadElegida: ModalidadEventoCurso | null = null;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit(): void {
    this.eventos = this.eventos || [];
    const previo = this.eventoId ? this.eventos.find(e => +e.Id === +this.eventoId) : null;
    // Con un solo evento futuro sale ya elegido.
    this.eventoElegido = previo || (this.eventos.length === 1 ? this.eventos[0] : null);
    if (this.eventoElegido && this.modalidad) {
      this.modalidadElegida = (this.eventoElegido.Modalidades || []).find(m => m.Modalidad === this.modalidad) || null;
    }
    // Con una sola modalidad, también.
    if (this.eventoElegido && !this.modalidadElegida && (this.eventoElegido.Modalidades || []).length === 1) {
      this.modalidadElegida = this.eventoElegido.Modalidades[0];
    }
  }

  get sePuedeAceptar(): boolean {
    return !!this.eventoElegido && !!this.modalidadElegida;
  }

  public elegirEvento(evento: EventoCurso): void {
    if (this.eventoElegido?.Id !== evento.Id) {
      this.eventoElegido = evento;
      this.modalidadElegida = (evento.Modalidades || []).length === 1 ? evento.Modalidades[0] : null;
    }
  }

  public elegirModalidad(modalidad: ModalidadEventoCurso): void {
    this.modalidadElegida = modalidad;
  }

  public textoFormato(evento: EventoCurso): string {
    return textoFormatoEvento(evento.Formato, evento.Almacen);
  }

  public textoPlazas(evento: EventoCurso): string {
    return textoPlazasLibres(evento.PlazasLibres);
  }

  public textoModalidad(modalidad: ModalidadEventoCurso): string {
    return textoModalidadCurso(modalidad);
  }

  /** «Masterclass PDRN · 15/11/2026 10:00 · Presencial en REI · Con cupón de productos: 100 €». */
  public textoResumen(): string {
    const e = this.eventoElegido;
    const fecha = e ? new Date(e.Fecha) : null;
    const dia = fecha && !isNaN(fecha.getTime())
      ? `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${fecha.getFullYear()}`
      : '';
    return [e?.Titulo, [dia, e?.HoraInicio].filter(t => !!t).join(' '), e ? this.textoFormato(e) : '', this.modalidadElegida ? this.textoModalidad(this.modalidadElegida) : '']
      .filter(t => !!t).join(' · ');
  }

  public aceptar(): void {
    if (!this.sePuedeAceptar) {
      return;
    }
    this.modalCtrl.dismiss({ evento: this.eventoElegido, modalidad: this.modalidadElegida, texto: this.textoResumen() }, 'elegido');
  }

  public quitar(): void {
    this.modalCtrl.dismiss(null, 'quitar');
  }

  public cancelar(): void {
    this.modalCtrl.dismiss(null, 'cancelar');
  }
}
