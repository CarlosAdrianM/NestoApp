import { Component, Input, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ResumenVentasService } from './resumen-ventas.service';
import { DetalleProducto, ResumenVentas } from './resumen-ventas.model';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics/ngx';
import { Usuario } from 'src/app/models/Usuario';

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

  // Drill-down
  esVistaDetalle: boolean = false;
  nombreFiltroActual: string = '';
  detalleProductos: DetalleProducto[] = [];

  // Toggle euros/unidades
  modoVisualizacion: 'euros' | 'unidades' = 'euros';

  constructor(private resumenVentasService: ResumenVentasService,
              private firebaseAnalytics: FirebaseAnalytics,
              private usuario: Usuario,
              private nav: NavController) {}

  ngOnInit(): void {
    this.cargarVentas();
  }

  cargarVentas(): void {
    if (!this.cliente || !this.contacto) {
      return;
    }

    this.cargando = true;
    this.esVistaDetalle = false;
    this.firebaseAnalytics.logEvent("cargar_ventas_cliente", {cliente: this.cliente, contacto: this.contacto, vendedor: this.usuario.vendedor});
    this.resumenVentasService
      .obtenerResumenVentas(this.cliente, this.contacto, this.modoComparativa, this.agruparPor)
      .subscribe({
        next: (datos) => {
          this.ventas = datos;
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

  desglosarProductos(venta: ResumenVentas): void {
    if (venta.nombre === 'TOTAL') {
      return;
    }

    this.cargando = true;
    this.nombreFiltroActual = venta.nombre;

    this.resumenVentasService
      .obtenerDetalleProductos(this.cliente, this.contacto, this.modoComparativa, this.agruparPor, venta.nombre)
      .subscribe({
        next: (datos) => {
          this.detalleProductos = datos;
          this.esVistaDetalle = true;
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar detalle de productos:', err);
          this.cargando = false;
        }
      });
  }

  volverAVistaAgrupada(): void {
    this.esVistaDetalle = false;
    this.detalleProductos = [];
    this.nombreFiltroActual = '';
  }

  abrirProducto(producto: DetalleProducto): void {
    if (!producto.numero) {
      console.warn('abrirProducto: numero vacío, producto:', producto);
      return;
    }
    this.nav.navigateForward('producto', {
      queryParams: { empresa: '1', producto: producto.numero }
    });
  }
}
