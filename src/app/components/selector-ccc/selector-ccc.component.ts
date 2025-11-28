import { Component, Input, OnInit, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { SelectorCCCService } from './selector-ccc.service';
import { CCC, CCC_SIN_CCC } from 'src/app/models/ccc.model';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';

@Component({
  selector: 'selector-ccc',
  templateUrl: './selector-ccc.component.html',
  styleUrls: ['./selector-ccc.component.scss'],
})
export class SelectorCCCComponent implements OnInit, OnChanges {

  @Input() public cliente: string;
  @Input() public contacto: string;
  @Input() public formaPago: string;
  @Input() public cccObligatorio: boolean = false;

  private _seleccionado: CCC;
  @Input()
  get seleccionado(): CCC {
    return this._seleccionado;
  }
  set seleccionado(value: CCC) {
    this._seleccionado = value;
  }

  @Output() public seleccionar: EventEmitter<CCC> = new EventEmitter();

  public cccs: CCC[] = [];
  public errorMessage: string;
  public cargando: boolean = false;

  constructor(
    private servicio: SelectorCCCService,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.cargarDatos();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cliente'] || changes['contacto']) {
      this.cargarDatos();
    }
    if (changes['formaPago'] && this.cccs.length > 0) {
      this.autoSeleccionarPorFormaPago();
    }
  }

  public cargarDatos(): void {
    if (!this.cliente) {
      this.cccs = [CCC_SIN_CCC];
      this.seleccionado = CCC_SIN_CCC;
      return;
    }

    this.cargando = true;
    this.servicio.getCCCs(
      Configuracion.EMPRESA_POR_DEFECTO,
      this.cliente,
      this.contacto || ''
    ).subscribe(
      async data => {
        this.cccs = data;
        this.autoSeleccionarPorFormaPago();
        this.cargando = false;
      },
      async error => {
        this.cargando = false;
        this.errorMessage = error;
        this.cccs = [CCC_SIN_CCC];
        this.seleccionado = CCC_SIN_CCC;
      }
    );
  }

  private autoSeleccionarPorFormaPago(): void {
    if (this.formaPago === 'RCB') {
      // Para recibo, auto-seleccionar el primer CCC válido
      const primerCCCValido = this.cccs.find(ccc => ccc.numero && ccc.estado >= 0);
      if (primerCCCValido) {
        this.seleccionado = primerCCCValido;
        this.seleccionar.emit(this.seleccionado);
      } else {
        this.seleccionado = CCC_SIN_CCC;
        this.seleccionar.emit(this.seleccionado);
      }
    } else {
      // Para otras formas de pago, seleccionar "(Sin CCC)"
      this.seleccionado = CCC_SIN_CCC;
      this.seleccionar.emit(this.seleccionado);
    }
  }

  public seleccionarCCC(ccc: CCC): void {
    this.seleccionado = ccc;
    this.seleccionar.emit(ccc);
  }

  public esCCCInvalido(ccc: CCC): boolean {
    return ccc.numero !== '' && ccc.estado < 0;
  }

  public compararCCC(ccc1: CCC, ccc2: CCC): boolean {
    return ccc1 && ccc2 ? ccc1.numero === ccc2.numero : ccc1 === ccc2;
  }
}
