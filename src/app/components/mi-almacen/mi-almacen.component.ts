import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AlmacenesFicticiosService } from 'src/app/services/almacenes-ficticios.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { FirebaseAnalytics } from 'src/app/services/firebase-analytics.service';
import {
  AlmacenFicticio, ExistenciaAlmacenFicticio, ExistenciasAlmacenFicticio, GrupoFamiliaAlmacenFicticio, TEXTO_SIN_ALMACEN_FICTICIO,
  agruparPorFamilia, almacenPorDefecto, filtrarExistencias, textoAlmacenFicticio, textoResumenExistencias, totalUnidades
} from 'src/app/models/almacen-ficticio.model';

/**
 * NestoApp#292 (gemela de NestoAPI#894): «Mi almacén». Lo que el vendedor tiene en su almacén ficticio: referencia,
 * nombre y unidades, por familia, con buscador y el total arriba. Solo consulta (meter y sacar lo hacen Almacén y las
 * tiendas desde Nesto). Quien ve varios (jefe de equipo) elige almacén, con el suyo por defecto. Sin sondeo: se carga al
 * entrar, al tirar hacia abajo y con el botón de actualizar. Textos de usted.
 */
@Component({
  selector: 'app-mi-almacen',
  templateUrl: './mi-almacen.component.html',
  styleUrls: ['./mi-almacen.component.scss'],
  standalone: false
})
export class MiAlmacenComponent {
  public almacenes: AlmacenFicticio[] = [];
  /** El código del almacén que se está viendo. */
  public almacen: string | null = null;
  public existencias: ExistenciasAlmacenFicticio | null = null;
  public filtro = '';
  public cargando = false;
  public mensaje = '';
  public readonly textoAlmacen = textoAlmacenFicticio;
  /** Para descartar la respuesta de un almacén que ya no es el elegido. */
  private peticion = 0;

  constructor(
    private servicio: AlmacenesFicticiosService,
    private nav: NavController,
    private errorHandler: ErrorHandlerService,
    private firebaseAnalytics: FirebaseAnalytics
  ) { }

  ionViewWillEnter(): void {
    this.cargar();
  }

  get variosAlmacenes(): boolean {
    return this.almacenes.length > 1;
  }

  get almacenActual(): AlmacenFicticio | null {
    return this.almacenes.find(a => (a.Codigo || '').trim() === this.almacen) || null;
  }

  get productosVisibles(): ExistenciaAlmacenFicticio[] {
    return filtrarExistencias(this.existencias?.Productos, this.filtro);
  }

  get grupos(): GrupoFamiliaAlmacenFicticio[] {
    return agruparPorFamilia(this.productosVisibles);
  }

  /** Arriba: el total del almacén (el que dice la API); con el buscador puesto, además, lo que se está viendo. */
  get resumen(): string {
    if (!this.existencias) {
      return '';
    }
    const productos = this.existencias.Productos || [];
    return textoResumenExistencias(this.existencias.NumeroProductos ?? productos.length, this.existencias.TotalUnidades ?? totalUnidades(productos));
  }

  get resumenFiltro(): string {
    if (!this.existencias || !(this.filtro || '').trim()) {
      return '';
    }
    const visibles = this.productosVisibles;
    return `Con «${this.filtro.trim()}»: ${textoResumenExistencias(visibles.length, totalUnidades(visibles))}`;
  }

  /** Recarga los almacenes y las existencias del elegido (o del suyo, la primera vez). `evento` = el de «tirar para refrescar». */
  public cargar(evento?: any): void {
    this.cargando = true;
    this.mensaje = '';
    this.servicio.leerAlmacenes().subscribe({
      next: almacenes => {
        this.almacenes = (almacenes || []).filter(a => !!(a?.Codigo || '').trim());
        if (this.almacenes.length === 0) {
          this.terminar(evento);
          this.almacen = null;
          this.existencias = null;
          this.mensaje = TEXTO_SIN_ALMACEN_FICTICIO;
          return;
        }
        if (!this.almacenActual) {
          this.almacen = (almacenPorDefecto(this.almacenes)?.Codigo || '').trim();
        }
        this.cargarExistencias(evento);
      },
      error: error => {
        this.terminar(evento);
        this.almacenes = [];
        this.existencias = null;
        this.mensaje = (error?.status === 404 || error?.statusCode === 404)
          ? 'La consulta del almacén todavía no está disponible en el servidor.'
          : this.errorHandler.extractErrorMessage(error);
      }
    });
  }

  public cambiarAlmacen(codigo: string): void {
    const nuevo = (codigo || '').toString().trim();
    if (!nuevo || nuevo === this.almacen) {
      return;
    }
    this.almacen = nuevo;
    this.filtro = '';
    this.cargarExistencias();
  }

  private cargarExistencias(evento?: any): void {
    const almacen = this.almacen;
    const peticion = ++this.peticion;
    this.cargando = true;
    this.mensaje = '';
    this.existencias = null;
    this.servicio.leerExistencias(almacen).subscribe({
      next: existencias => {
        if (peticion !== this.peticion) {
          return;
        }
        this.terminar(evento);
        this.existencias = existencias;
        this.firebaseAnalytics.logEvent('mi_almacen_abrir', { almacen, productos: (existencias?.Productos || []).length });
      },
      error: error => {
        if (peticion !== this.peticion) {
          return;
        }
        this.terminar(evento);
        // 403 (no es suyo ni de su equipo) y 404 (no es un ficticio activo): el mensaje de la API, de usted.
        this.mensaje = this.errorHandler.extractErrorMessage(error);
      }
    });
  }

  private terminar(evento?: any): void {
    this.cargando = false;
    evento?.target?.complete?.();
  }

  public abrirProducto(producto: ExistenciaAlmacenFicticio): void {
    const referencia = (producto?.Producto || '').toString().trim();
    if (referencia) {
      this.nav.navigateForward('producto', { queryParams: { empresa: '1', producto: referencia } });
    }
  }
}
