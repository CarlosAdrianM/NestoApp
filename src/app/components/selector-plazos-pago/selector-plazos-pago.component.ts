import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { NavController, AlertController, LoadingController } from '@ionic/angular';
import { SelectorBase } from '../selectorbase/selectorbase.component';
import { SelectorPlazosPagoService } from './selector-plazos-pago.service';
import { InfoDeudaCliente, PlazoPago } from 'src/app/models/plazo-pago.model';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'selector-plazos-pago',
  templateUrl: './selector-plazos-pago.component.html',
  styleUrls: ['./selector-plazos-pago.component.scss'],
})
export class SelectorPlazosPagoComponent extends SelectorBase implements OnInit, OnChanges {
  @Input() public cliente: any;
  @Input() public formaPago: string;

  // El seleccionado puede venir como string (código) o como objeto PlazoPago
  private _seleccionado: any;
  @Input()
  public get seleccionado(): any {
    return this._seleccionado;
  }
  public set seleccionado(value: any) {
    this._seleccionado = value;
    // Actualizar el código para el select
    this.seleccionadoCodigo = this.obtenerCodigo(value);
  }

  // Código del plazo seleccionado (para el ion-select)
  public seleccionadoCodigo: string;

  private _totalPedido: number;
  @Input()
  public get totalPedido(): number {
    return this._totalPedido;
  }
  public set totalPedido(value: number) {
    if (value !== this._totalPedido) {
      this._totalPedido = value;
      this.solicitarCarga$.next();
    }
  }

  public infoDeuda: InfoDeudaCliente = null;
  public cargando: boolean = false;

  private solicitarCarga$ = new Subject<void>();

  private nav: NavController;
  private servicio: SelectorPlazosPagoService;
  private alertCtrl: AlertController;
  private loadingCtrl: LoadingController;

  constructor(servicio: SelectorPlazosPagoService, nav: NavController, alertCtrl: AlertController, loadingCtrl: LoadingController) {
    super();
    this.nav = nav;
    this.servicio = servicio;
    this.alertCtrl = alertCtrl;
    this.loadingCtrl = loadingCtrl;

    this.solicitarCarga$.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.cargarDatos();
    });
  }

  ngOnInit() {
    this.cargarDatos();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['formaPago'] && !changes['formaPago'].firstChange) {
      this.solicitarCarga$.next();
    }
    if (changes['seleccionado']) {
      this.seleccionadoCodigo = this.obtenerCodigo(this.seleccionado);
    }
  }

  // Extrae el código del plazo, ya sea string u objeto
  private obtenerCodigo(valor: any): string {
    if (!valor) return '';
    if (typeof valor === 'string') return valor;
    if (valor.plazoPago) return valor.plazoPago;
    return '';
  }

  public cargarDatos(): void {
    this.cargando = true;

    // Si hay cliente, usar endpoint con info de deuda
    if (this.cliente) {
      this.servicio.getPlazosPagoConInfoDeuda(this.cliente).subscribe(
        async response => {
          this.cargando = false;
          this.infoDeuda = response.infoDeuda;
          const data = response.plazosPago;

          if (!data || data.length === 0) {
            let alert = await this.alertCtrl.create({
              message: 'Error',
              subHeader: 'Error al cargar los plazos de pago',
              buttons: ['Ok'],
            });
            await alert.present();
          } else {
            this.inicializarDatos(data);
            this.sincronizarSeleccion(data);
          }
        },
        error => {
          this.cargando = false;
          // Si falla el endpoint con info de deuda, usar el básico
          this.cargarDatosSinInfoDeuda();
        }
      );
    } else {
      this.cargarDatosSinInfoDeuda();
    }
  }

  private cargarDatosSinInfoDeuda(): void {
    this.cargando = true;
    this.infoDeuda = null;
    this.servicio.getPlazosPago(this.cliente, this.formaPago, this.totalPedido).subscribe(
      async data => {
        this.cargando = false;
        if (!data || data.length === 0) {
          let alert = await this.alertCtrl.create({
            message: 'Error',
            subHeader: 'Error al cargar los plazos de pago',
            buttons: ['Ok'],
          });
          await alert.present();
        } else {
          this.inicializarDatos(data);
          this.sincronizarSeleccion(data);
        }
      },
      error => {
        this.cargando = false;
        this.errorMessage = <any>error;
      }
    );
  }

  private sincronizarSeleccion(data: PlazoPago[]): void {
    const codigoActual = this.obtenerCodigo(this.seleccionado);

    if (codigoActual) {
      // Verificar si el código actual está en la lista
      const plazoEnLista = data.find(p => p.plazoPago === codigoActual);
      if (plazoEnLista) {
        // El plazo existe, sincronizar el código
        this.seleccionadoCodigo = codigoActual;
      } else if (data.length > 0) {
        // El plazo no existe, seleccionar el primero
        this.seleccionadoCodigo = data[0].plazoPago;
        this.seleccionarDato(data[0]);
      }
    } else if (data.length > 0) {
      // No hay selección, seleccionar el primero
      this.seleccionadoCodigo = data[0].plazoPago;
    }
  }

  obtenerPlazo(event: any) {
    const codigo = event.detail.value;
    const plazo = this.datosFiltrados.find((p) => p.plazoPago === codigo);
    if (plazo) {
      this.seleccionarDato(plazo);
    }
  }

  public tieneRestriccionDeuda(): boolean {
    return this.infoDeuda &&
      (this.infoDeuda.tieneDeudaVencida || this.infoDeuda.tieneImpagados);
  }

  public getMensajeDeuda(): string {
    if (!this.infoDeuda) return '';

    let mensaje = '⚠️ Solo se permiten formas de pago al contado';

    if (this.infoDeuda.motivoRestriccion) {
      mensaje += ` debido a: ${this.infoDeuda.motivoRestriccion}`;
    }

    const detalles: string[] = [];
    if (this.infoDeuda.tieneImpagados && this.infoDeuda.importeImpagados) {
      detalles.push(`Impagados: ${this.infoDeuda.importeImpagados.toFixed(2)} €`);
    }
    if (this.infoDeuda.tieneDeudaVencida && this.infoDeuda.importeDeudaVencida) {
      let detalle = `Cartera vencida: ${this.infoDeuda.importeDeudaVencida.toFixed(2)} €`;
      if (this.infoDeuda.diasVencimiento) {
        detalle += ` (${this.infoDeuda.diasVencimiento} días)`;
      }
      detalles.push(detalle);
    }

    if (detalles.length > 0) {
      mensaje += ' • ' + detalles.join(' • ');
    }

    return mensaje;
  }

  public getColorDeuda(): string {
    if (!this.infoDeuda) return '';
    // Usar warning (naranja) como en Nesto para ambos casos
    if (this.infoDeuda.tieneImpagados || this.infoDeuda.tieneDeudaVencida) {
      return 'warning';
    }
    return '';
  }
}
