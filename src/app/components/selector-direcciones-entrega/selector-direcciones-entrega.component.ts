import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { SelectorBase } from '../selectorbase/selectorbase.component';
import { SelectorDireccionesEntregaService } from './selector-direcciones-entrega.service';

@Component({
  selector: 'selector-direcciones-entrega',
  templateUrl: './selector-direcciones-entrega.component.html',
  styleUrls: ['./selector-direcciones-entrega.component.scss'],
  inputs: ['cliente', 'seleccionado', 'totalPedido'],
})
export class SelectorDireccionesEntregaComponent extends SelectorBase {
  private servicio: SelectorDireccionesEntregaService;
  private alertCtrl: AlertController;
  public direccionesEntrega: any[];
  public direccionSeleccionada: any;

  // @Input() 
  private _cliente: any;
  get cliente() {
      return this._cliente;
  }
  set cliente(value: any) {
      if (value && value.trim() != this._cliente){
          this.cargarDatos(value);
          this._cliente = value;    
      }
  }
  public seleccionado: string;

  private _totalPedido: number;
  get totalPedido() {
    return this._totalPedido;
  }
  set totalPedido(value: number) {
    if (value != this._totalPedido) {
        this.cargarDatos(this.cliente, value);
        this._totalPedido = value;
    }
  }

  constructor(servicio: SelectorDireccionesEntregaService, alertCtrl: AlertController) {
      super();
      this.servicio = servicio;
      this.alertCtrl = alertCtrl;
  }

    public cargarDatos(cliente: any, totalPedido: number = 0): void {
      if (!cliente) {
          return;
      }
      this.servicio.direccionesEntrega(cliente, totalPedido).subscribe(
          async data => {
              if (data.length === 0) {
                  let alert: any = await this.alertCtrl.create({
                      message: 'Error',
                      subHeader: 'El cliente ' + cliente.cliente + ' no tiene ninguna dirección de entrega',
                      buttons: ['Ok'],
                  });
                  await alert.present();
              } else {
                  this.direccionesEntrega = data;
                  if (this.seleccionado) {
                      this.direccionSeleccionada = this.direccionesEntrega.find(d => d.contacto.trim() == this.seleccionado.trim());
                  } else {
                      this.direccionSeleccionada = this.direccionesEntrega.find(d => d.esDireccionPorDefecto);
                  }
                  this.seleccionarDato(this.direccionSeleccionada);
              }
          },
          error => this.errorMessage = <any>error
      );
  }

  public seleccionarDireccion(direccion: any): void {
      this.direccionSeleccionada = direccion;
      this.seleccionarDato(direccion);
  }

  public ngOnChanges(changes): void {
      //this.cargarDatos(this.cliente);
  }

  public colorEstado(estado: number): string {
      if (estado == 0 || estado == 9) {
          return "success";
      }
      if (estado == 5) {
          return "danger";
      }
      if (estado == 7) {
          return "primary";
      }

      return "default";
  }
}
