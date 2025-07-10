import { Component, Input, OnInit } from '@angular/core';
import { ResumenVentasService } from './resumen-ventas.service';
import { ResumenVentas } from './resumen-ventas.model';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics/ngx';

@Component({
  selector: 'app-resumen-ventas',
  templateUrl: './resumen-ventas.component.html',
  styleUrls: ['./resumen-ventas.component.scss']
})
export class ResumenVentasComponent implements OnInit {
  @Input() cliente: string = '';
  @Input() contacto: string = '';

  ventas: ResumenVentas[] = [];
  cargando: boolean = false;

  modoComparativa: 'anual' | 'ultimos12meses' = 'anual';
  agruparPor: 'grupo' | 'familia' | 'subgrupo' = 'grupo';

  constructor(private resumenVentasService: ResumenVentasService, 
              private firebaseAnalytics: FirebaseAnalytics) {}

  ngOnInit(): void {
    this.cargarVentas();
  }

  cargarVentas(): void {
    if (!this.cliente || !this.contacto) {
      return;
    }

    this.cargando = true;
    this.firebaseAnalytics.logEvent("cargar_ventas_cliente", {cliente: this.cliente, contacto: this.contacto});
    this.resumenVentasService
      .obtenerResumenVentas(this.cliente, this.contacto, this.modoComparativa, this.agruparPor)
      .subscribe({
        next: (datos) => {
          this.ventas = datos; //.sort((a, b) => a.nombre.localeCompare(b.nombre));
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar resumen de ventas:', err);
          this.cargando = false;
        }
      });
  }

  cambiarComparativa(nuevaComparativa: 'anual' | 'ultimos12meses'): void {
    this.modoComparativa = nuevaComparativa;
    this.cargarVentas();
  }

  cambiarAgrupacion(nuevaAgrupacion: 'grupo' | 'familia' | 'subgrupo'): void {
    this.agruparPor = nuevaAgrupacion;
    this.cargarVentas();
  }
}

