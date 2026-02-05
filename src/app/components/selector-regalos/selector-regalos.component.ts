import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PlantillaVentaService } from '../plantilla-venta/plantilla-venta.service';
import { ProductoBonificable, ProductosBonificablesResponse } from '../../models/ganavisiones.model';

export interface RegaloSeleccionado {
  producto: ProductoBonificable;
  cantidad: number;
}

@Component({
  selector: 'selector-regalos',
  templateUrl: './selector-regalos.component.html',
  styleUrls: ['./selector-regalos.component.scss']
})
export class SelectorRegalosComponent {

  public productosBonificables: ProductoBonificable[] = [];
  public productosFiltrados: ProductoBonificable[] = [];
  public ganavisionesDisponibles: number = 0;
  public cargando: boolean = false;
  public errorMessage: string = '';

  // Mapa de cantidades seleccionadas por ProductoId
  public cantidadesSeleccionadas: Map<string, number> = new Map();

  private _empresa: string;
  private _cliente: string;
  private _almacen: string;
  private _baseImponibleBonificable: number;
  private _servirJunto: boolean = true;

  @Input()
  set empresa(value: string) {
    this._empresa = value;
  }
  get empresa(): string {
    return this._empresa;
  }

  @Input()
  set cliente(value: string) {
    if (value && value !== this._cliente) {
      this._cliente = value;
      this.cargarProductosBonificables();
    }
  }
  get cliente(): string {
    return this._cliente;
  }

  @Input()
  set almacen(value: string) {
    this._almacen = value;
  }
  get almacen(): string {
    return this._almacen;
  }

  @Input()
  set baseImponibleBonificable(value: number) {
    if (value !== this._baseImponibleBonificable) {
      this._baseImponibleBonificable = value;
      this.cargarProductosBonificables();
    }
  }
  get baseImponibleBonificable(): number {
    return this._baseImponibleBonificable;
  }

  @Input()
  set servirJunto(value: boolean) {
    if (value !== this._servirJunto) {
      this._servirJunto = value;
      this.cargarProductosBonificables();
    }
  }
  get servirJunto(): boolean {
    return this._servirJunto;
  }

  // Input para recibir regalos ya seleccionados (para restaurar estado)
  @Input()
  set regalosSeleccionados(value: RegaloSeleccionado[]) {
    if (value && value.length > 0) {
      // Restaurar el mapa de cantidades desde los regalos seleccionados
      this.cantidadesSeleccionadas.clear();
      value.forEach(regalo => {
        this.cantidadesSeleccionadas.set(regalo.producto.ProductoId, regalo.cantidad);
      });
    } else if (value && value.length === 0) {
      // Si se pasa un array vacío, limpiar selecciones
      this.cantidadesSeleccionadas.clear();
    }
  }

  @Output() regalosChange = new EventEmitter<RegaloSeleccionado[]>();
  @Output() regalosInvalidados = new EventEmitter<string[]>(); // Emite nombres de productos eliminados
  @Output() productosCargados = new EventEmitter<number>(); // Emite el número de productos disponibles

  constructor(private servicio: PlantillaVentaService) {}

  get ganavisionesUsados(): number {
    let total = 0;
    this.cantidadesSeleccionadas.forEach((cantidad, productoId) => {
      const producto = this.productosBonificables.find(p => p.ProductoId === productoId);
      if (producto) {
        total += cantidad * producto.Ganavisiones;
      }
    });
    return total;
  }

  get ganavisionesRestantes(): number {
    return this.ganavisionesDisponibles - this.ganavisionesUsados;
  }

  get porcentajeUsado(): number {
    if (this.ganavisionesDisponibles === 0) return 0;
    return Math.min(100, (this.ganavisionesUsados / this.ganavisionesDisponibles) * 100);
  }

  get hayRegalosSeleccionados(): boolean {
    return this.ganavisionesUsados > 0;
  }

  public cargarProductosBonificables(): void {
    if (!this._empresa || !this._cliente || !this._almacen || !this._baseImponibleBonificable) {
      return;
    }

    this.cargando = true;
    this.errorMessage = '';

    this.servicio.cargarProductosBonificables(
      this._empresa,
      this._baseImponibleBonificable,
      this._almacen,
      this._servirJunto,
      this._cliente
    ).subscribe(
      (response: ProductosBonificablesResponse) => {
        this.ganavisionesDisponibles = response.GanavisionesDisponibles;
        this.productosBonificables = response.Productos;
        this.productosFiltrados = response.Productos;
        this.cargando = false;

        // Notificar al padre cuántos productos hay disponibles
        this.productosCargados.emit(response.Productos.length);

        // Limpiar selecciones de productos que ya no están disponibles
        this.limpiarSeleccionesInvalidas();
      },
      error => {
        this.errorMessage = 'Error al cargar productos bonificables';
        this.cargando = false;
        console.error('Error cargando productos bonificables:', error);
      }
    );
  }

  private limpiarSeleccionesInvalidas(): void {
    const productosIds = new Set(this.productosBonificables.map(p => p.ProductoId));
    const productosEliminados: string[] = [];

    this.cantidadesSeleccionadas.forEach((_, productoId) => {
      if (!productosIds.has(productoId)) {
        // Buscar el nombre del producto en los productos anteriores (si los tenemos en regalosSeleccionados)
        productosEliminados.push(productoId);
        this.cantidadesSeleccionadas.delete(productoId);
      }
    });

    if (productosEliminados.length > 0) {
      this.regalosInvalidados.emit(productosEliminados);
    }

    this.emitirCambios();
  }

  public getCantidad(productoId: string): number {
    return this.cantidadesSeleccionadas.get(productoId) || 0;
  }

  public incrementarCantidad(producto: ProductoBonificable): void {
    const cantidadActual = this.getCantidad(producto.ProductoId);
    const ganavisionesNecesarios = producto.Ganavisiones;

    // Verificar que hay suficientes ganavisiones
    if (this.ganavisionesRestantes >= ganavisionesNecesarios) {
      // Verificar que hay stock
      if (cantidadActual < producto.StockTotal) {
        this.cantidadesSeleccionadas.set(producto.ProductoId, cantidadActual + 1);
        this.emitirCambios();
      }
    }
  }

  public decrementarCantidad(producto: ProductoBonificable): void {
    const cantidadActual = this.getCantidad(producto.ProductoId);
    if (cantidadActual > 0) {
      if (cantidadActual === 1) {
        this.cantidadesSeleccionadas.delete(producto.ProductoId);
      } else {
        this.cantidadesSeleccionadas.set(producto.ProductoId, cantidadActual - 1);
      }
      this.emitirCambios();
    }
  }

  public puedeIncrementar(producto: ProductoBonificable): boolean {
    const cantidadActual = this.getCantidad(producto.ProductoId);
    const tieneStock = cantidadActual < producto.StockTotal;
    const tieneGanavisiones = this.ganavisionesRestantes >= producto.Ganavisiones;
    return tieneStock && tieneGanavisiones;
  }

  private emitirCambios(): void {
    const regalos: RegaloSeleccionado[] = [];
    this.cantidadesSeleccionadas.forEach((cantidad, productoId) => {
      const producto = this.productosBonificables.find(p => p.ProductoId === productoId);
      if (producto && cantidad > 0) {
        regalos.push({ producto, cantidad });
      }
    });
    this.regalosChange.emit(regalos);
  }

  public filtrarBusqueda(event: any): void {
    const filtro = event.target.value?.toUpperCase() || '';
    if (!filtro) {
      this.productosFiltrados = this.productosBonificables;
    } else {
      this.productosFiltrados = this.productosBonificables.filter(p =>
        p.ProductoNombre.toUpperCase().includes(filtro) ||
        p.ProductoId.toUpperCase().includes(filtro)
      );
    }
  }

  public limpiarSeleccion(): void {
    this.cantidadesSeleccionadas.clear();
    this.emitirCambios();
  }
}
