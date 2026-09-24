import { Component, Input, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { SelectorCCCService } from './selector-ccc.service';
import { CCC, descripcionCCC, elegirCCC, esCCCValido, motivoCCCNoValido } from 'src/app/models/ccc.model';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';

/**
 * NestoApp#189 (réplica de Nesto#486): con recibo bancario, qué cuenta se va a cargar. Si hay
 * varias válidas se puede elegir; si no hay ninguna, se avisa de que el recibo no irá al banco
 * (avisar, no bloquear). El padre solo lo pinta cuando la forma de pago es RCB.
 */
@Component({
    selector: 'selector-ccc',
    templateUrl: './selector-ccc.component.html',
    styleUrls: ['./selector-ccc.component.scss'],
    standalone: false
})
export class SelectorCCCComponent implements OnChanges {

  @Input() public empresa: string = Configuracion.EMPRESA_POR_DEFECTO;
  @Input() public cliente: string;
  @Input() public contacto: string;
  /** Número de la ficha CCC que lleva ahora el pedido (el de la dirección de entrega). */
  @Input() public seleccionado: string;

  @Output() public seleccionar: EventEmitter<string> = new EventEmitter();

  public cccs: CCC[] = [];
  public cargando: boolean = false;
  public errorCarga: boolean = false;
  /** La cuenta que traía la dirección y no vale, cuando se ha cambiado por otra: se explica por qué. */
  public cuentaDescartada: CCC | null = null;

  constructor(private servicio: SelectorCCCService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cliente'] || changes['contacto'] || changes['empresa']) {
      this.cargarDatos();
    }
  }

  get cccsValidos(): CCC[] {
    return this.cccs.filter(esCCCValido);
  }

  /** Solo cuando se ha podido comprobar: un fallo de red no es «no tiene cuenta». */
  get sinCCCValido(): boolean {
    return !this.cargando && !this.errorCarga && this.cccsValidos.length === 0;
  }

  get numeroSeleccionado(): string {
    return (this.seleccionado || '').toString().trim();
  }

  public descripcion(ccc: CCC): string {
    return descripcionCCC(ccc);
  }

  public motivo(ccc: CCC): string | null {
    return motivoCCCNoValido(ccc);
  }

  public cargarDatos(): void {
    if (!this.cliente) {
      this.cccs = [];
      return;
    }
    this.cargando = true;
    this.errorCarga = false;
    this.cuentaDescartada = null;
    this.servicio.getCCCs(
      (this.empresa || Configuracion.EMPRESA_POR_DEFECTO).toString().trim(),
      this.cliente.toString().trim(),
      (this.contacto || '').toString().trim()
    ).subscribe(
      data => {
        this.cccs = data || [];
        this.cargando = false;
        const elegido = elegirCCC(this.cccs, this.seleccionado);
        if (elegido && elegido !== this.numeroSeleccionado) {
          this.cuentaDescartada = this.cccs.find(c => (c.numero || '').trim() === this.numeroSeleccionado && !esCCCValido(c)) || null;
          this.seleccionarCCC(elegido);
        }
      },
      error => {
        console.error('No se han podido leer las cuentas bancarias del cliente', error);
        this.cccs = [];
        this.cargando = false;
        this.errorCarga = true;
      }
    );
  }

  public seleccionarCCC(numero: string): void {
    this.seleccionado = numero;
    this.seleccionar.emit(numero);
  }
}
