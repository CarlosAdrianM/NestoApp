import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { FirebaseAnalytics } from 'src/app/services/firebase-analytics.service';
import {
  OfertaCombinada, OfertaEscalonada, OfertaFamilia, TipoOfertaAutorizada
} from '../../models/ofertas-autorizadas.model';
import { OfertasAutorizadasService } from './ofertas-autorizadas.service';

/**
 * Issue #137 (NestoAPI#233): pantalla de consulta (solo lectura) de las ofertas autorizadas
 * vigentes, en sus tres modalidades. Es el destino del deeplink de la push que se manda al
 * autorizar una oferta: la notificación trae `ruta` = /ofertas-autorizadas y, si los trae,
 * `tipo` e `id` para abrir directamente la oferta concreta.
 */
@Component({
  selector: 'app-ofertas-autorizadas',
  templateUrl: './ofertas-autorizadas.component.html',
  styleUrls: ['./ofertas-autorizadas.component.scss'],
  standalone: false
})
export class OfertasAutorizadasComponent {

  public tipoSeleccionado: TipoOfertaAutorizada = 'combinada';
  public combinadas: OfertaCombinada[] = [];
  public familias: OfertaFamilia[] = [];
  public escalonadas: OfertaEscalonada[] = [];
  public cargando: boolean = false;
  public cargaInicialHecha: boolean = false;
  /** Clave "tipo-id" de la oferta desplegada; solo hay una abierta a la vez. */
  public ofertaAbierta: string | null = null;

  constructor(
    private servicio: OfertasAutorizadasService,
    private route: ActivatedRoute,
    private toastCtrl: ToastController,
    private errorHandler: ErrorHandlerService,
    private firebaseAnalytics: FirebaseAnalytics
  ) { }

  ionViewWillEnter(): void {
    this.aplicarParametrosDeeplink();
    if (!this.cargaInicialHecha) {
      this.cargar();
    }
  }

  /**
   * La push manda `tipo` e `id` en los datos de la notificación y el deeplink los pasa como
   * query params. Si no vienen (o vienen mal), se enseña el listado entero.
   */
  private aplicarParametrosDeeplink(): void {
    const params = this.route.snapshot.queryParams || {};
    const tipo: string = params.tipo;
    if (tipo === 'combinada' || tipo === 'familia' || tipo === 'escalonada') {
      this.tipoSeleccionado = tipo;
    }
    if (params.id) {
      this.ofertaAbierta = this.tipoSeleccionado + '-' + params.id;
    }
  }

  public cargar(event?: any): void {
    this.cargando = true;
    this.servicio.cargarTodas().subscribe({
      next: datos => {
        this.combinadas = datos.combinadas;
        this.familias = datos.familias;
        this.escalonadas = datos.escalonadas;
        this.cargando = false;
        this.cargaInicialHecha = true;
        this.firebaseAnalytics.logEvent('ofertas_autorizadas_consultar', { tipo: this.tipoSeleccionado });
        if (event) { event.target.complete(); }
      },
      error: error => {
        this.cargando = false;
        if (event) { event.target.complete(); }
        this.toastCtrl.create({
          message: 'No se han podido cargar las ofertas: ' + this.errorHandler.extractErrorMessage(error),
          duration: 4000,
          color: 'danger'
        }).then(t => t.present());
      }
    });
  }

  public cambiarTipo(evento: any): void {
    this.tipoSeleccionado = evento.detail.value;
    this.ofertaAbierta = null;
  }

  public alternarOferta(tipo: TipoOfertaAutorizada, id: number): void {
    const clave = tipo + '-' + id;
    this.ofertaAbierta = this.ofertaAbierta === clave ? null : clave;
  }

  public estaAbierta(tipo: TipoOfertaAutorizada, id: number): boolean {
    return this.ofertaAbierta === tipo + '-' + id;
  }

  public get hayOfertas(): boolean {
    if (this.tipoSeleccionado === 'combinada') { return this.combinadas.length > 0; }
    if (this.tipoSeleccionado === 'familia') { return this.familias.length > 0; }
    return this.escalonadas.length > 0;
  }

  public vigencia(desde?: string, hasta?: string): string {
    const inicio = this.fechaCorta(desde);
    const fin = this.fechaCorta(hasta);
    if (inicio && fin) { return 'Del ' + inicio + ' al ' + fin; }
    if (fin) { return 'Hasta el ' + fin; }
    if (inicio) { return 'Desde el ' + inicio; }
    return 'Sin fecha de fin';
  }

  private fechaCorta(fecha?: string): string | null {
    if (!fecha) { return null; }
    const d = new Date(fecha);
    return isNaN(d.getTime()) ? null : d.toLocaleDateString('es-ES');
  }

  /**
   * Las líneas sin producto son filtros (#282/#289): casan con cualquier producto de una
   * familia, un grupo/subgrupo o un prefijo del nombre, así que se describen con palabras.
   */
  public descripcionLinea(linea: any): string {
    if (linea.Producto) {
      return linea.Producto.trim() + ' - ' + (linea.ProductoNombre || '').trim();
    }
    const criterios: string[] = [];
    if (linea.Familia) { criterios.push('familia ' + linea.Familia.trim()); }
    if (linea.Grupo) { criterios.push('grupo ' + linea.Grupo.trim()); }
    if (linea.Subgrupo) { criterios.push('subgrupo ' + linea.Subgrupo.trim()); }
    if (linea.FiltroProducto) { criterios.push('nombre que empiece por "' + linea.FiltroProducto.trim() + '"'); }
    return criterios.length ? 'Cualquier producto de ' + criterios.join(', ') : 'Cualquier producto';
  }

  /** Las líneas del mismo grupo de alternativa son intercambiables: "elige 1 de estos". */
  public textoCantidad(linea: any): string {
    const cantidad = linea.PermitirCantidadMenor ? 'hasta ' + linea.Cantidad : '' + linea.Cantidad;
    return cantidad + ' ud. a ' + this.importe(linea.Precio);
  }

  public importe(valor: number): string {
    return (valor || 0).toFixed(2).replace('.', ',') + ' €';
  }

  public porcentaje(tantoPorUno: number): string {
    return ((tantoPorUno || 0) * 100).toFixed(2).replace('.', ',').replace(',00', '') + ' %';
  }
}
