import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { ComisionesService } from './Comisiones.service';
import { ComisionesDetalleComponent } from '../ComisionesDetalle/ComisionesDetalle.component';
import { Usuario } from '../../models/Usuario';
import { SelectorVendedoresComponent } from '../../components/SelectorVendedores/SelectorVendedores.component';

@Component({
  templateUrl: 'Comisiones.html',
})
export class ComisionesComponent {
  public resumen: any;
  private hoy: Date = new Date();
  private mesActual: number = this.hoy.getMonth();
  private mesSeleccionado: number = this.hoy.getMonth();
  private annoActual: number = this.hoy.getFullYear();
  private annoSeleccionado: number = this.hoy.getFullYear();
  public nombreMesSeleccionado: string = this.hoy.toLocaleDateString('es-ES', { month: 'long' });
  testCheckboxOpen: boolean;
  testCheckboxResult;
  public incluirAlbaranes: boolean = true;
  public deshabilitarIncluirAlbaranes: boolean = false;
  public vendedorSeleccionado: string;
  
  constructor(private servicio: ComisionesService, private nav: NavController,
    private navParams: NavParams, public alertCtrl: AlertController,
    public loadingCtrl: LoadingController, private usuario: Usuario
  ) {
    this.vendedorSeleccionado = usuario.vendedor;
  }
  
  ngOnInit() {
    this.cargarResumen();
  };

  seleccionarVendedor(vendedor: string) {
    this.vendedorSeleccionado = vendedor;
    this.cargarResumen();
  }

  cargarResumen() {
    if (!this.vendedorSeleccionado) {
      return;
    }
    //this.resumen = this.servicio.cargarPrueba();
    
    let loading: any = this.loadingCtrl.create({
      content: 'Cargando Comisiones...',
    });
    loading.present();
    this.servicio.cargarResumen(this.vendedorSeleccionado, this.mesSeleccionado + 1, this.annoSeleccionado, this.incluirAlbaranes)
      .subscribe(
      data => {
        if (data.length === 0) {
          let alert = this.alertCtrl.create({
            title: 'Error',
            subTitle: 'No se han cargado correctamente las comisiones',
            buttons: ['Ok'],
          });
          alert.present();
        } else {
          this.resumen = data;
        }
      },
      error => {
        loading.dismiss();
      },
      () => {
        loading.dismiss();
      }
    );
  }
  
  abrirDetalle(etiqueta: string) {
    this.nav.push(ComisionesDetalleComponent, {
      vendedor: this.vendedorSeleccionado, anno: this.annoSeleccionado, mes: this.mesSeleccionado+1, 
      incluirAlbaranes: this.incluirAlbaranes, etiqueta: etiqueta 
    });
  }

  doCheckbox() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Seleccione el mes deseado');

    alert.addInput({
      type: 'radio',
      label: 'Enero',
      value: '0',
      checked: this.mesSeleccionado == 0
    });

    alert.addInput({
      type: 'radio',
      label: 'Febrero',
      value: '1',
      checked: this.mesSeleccionado == 1
    });

    alert.addInput({
      type: 'radio',
      label: 'Marzo',
      value: '2',
      checked: this.mesSeleccionado == 2
    });

    alert.addInput({
      type: 'radio',
      label: 'Abril',
      value: '3',
      checked: this.mesSeleccionado == 3
    });

    alert.addInput({
      type: 'radio',
      label: 'Mayo',
      value: '4',
      checked: this.mesSeleccionado == 4
    });

    alert.addInput({
      type: 'radio',
      label: 'Junio',
      value: '5',
      checked: this.mesSeleccionado == 5
    });

    alert.addInput({
      type: 'radio',
      label: 'Julio',
      value: '6',
      checked: this.mesSeleccionado == 6
    });

    alert.addInput({
      type: 'radio',
      label: 'Agosto',
      value: '7',
      checked: this.mesSeleccionado == 7
    });

    alert.addInput({
      type: 'radio',
      label: 'Septiembre',
      value: '8',
      checked: this.mesSeleccionado == 8
    });

    alert.addInput({
      type: 'radio',
      label: 'Octubre',
      value: '9',
      checked: this.mesSeleccionado == 9
    });

    alert.addInput({
      type: 'radio',
      label: 'Noviembre',
      value: '10',
      checked: this.mesSeleccionado == 10
    });

    alert.addInput({
      type: 'radio',
      label: 'Diciembre',
      value: '11',
      checked: this.mesSeleccionado == 11
    });


    alert.addButton('Cancelar');
    alert.addButton({
      text: 'OK',
      handler: data => {
        this.mesSeleccionado = +data;
        if (this.mesSeleccionado <= this.mesActual) {
          this.annoSeleccionado = this.annoActual
        } else {
          this.annoSeleccionado = this.annoActual - 1;
        }
        this.deshabilitarIncluirAlbaranes = this.mesActual != this.mesSeleccionado;
        let fechaNombreMes: Date = new Date(this.annoSeleccionado, this.mesSeleccionado);
        this.nombreMesSeleccionado = fechaNombreMes.toLocaleDateString('es-ES', { month: 'long' }) + " " + this.annoSeleccionado;
        if (this.incluirAlbaranes == this.deshabilitarIncluirAlbaranes) {
          this.incluirAlbaranes = !this.deshabilitarIncluirAlbaranes;
        } else {
          this.cargarResumen();
        }
      }
    });
    alert.present().then(() => {
      this.testCheckboxOpen = true;
    });
  }
  
}
