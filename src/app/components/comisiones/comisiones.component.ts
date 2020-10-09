import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from '@ionic/angular';
import { Usuario } from 'src/app/models/Usuario';
import { ComisionesService } from './comisiones.service';

@Component({
  selector: 'app-comisiones',
  templateUrl: './comisiones.component.html',
  styleUrls: ['./comisiones.component.scss'],
})
export class ComisionesComponent implements OnInit {
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
  public incluirPicking: boolean = false;
  public deshabilitarIncluirAlbaranes: boolean = false;
  public vendedorSeleccionado: string;
  
  constructor(
    private servicio: ComisionesService, 
    private nav: NavController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController, 
    public usuario: Usuario
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

  async cargarResumen() {
    if (!this.vendedorSeleccionado) {
      return;
    }
    //this.resumen = this.servicio.cargarPrueba();
    
    let loading: any = await this.loadingCtrl.create({
      message: 'Cargando Comisiones...',
    });
    await loading.present();
    this.servicio.cargarResumen(this.vendedorSeleccionado, this.mesSeleccionado + 1, this.annoSeleccionado, this.incluirAlbaranes, this.incluirPicking)
      .subscribe(
      async data => {
        if (data.length === 0) {
          let alert = await this.alertCtrl.create({
            message: 'Error',
            subHeader: 'No se han cargado correctamente las comisiones',
            buttons: ['Ok'],
          });
          await alert.present();
        } else {
          this.resumen = data;
        }
      },
      async error => {
        await loading.dismiss();
      },
      async () => {
        await loading.dismiss();
      }
    );
  }
  
  abrirDetalle(etiqueta: string) {
    this.nav.navigateForward('comisiones-detalle', { queryParams: {
      vendedor: this.vendedorSeleccionado, anno: this.annoSeleccionado, mes: this.mesSeleccionado+1, 
      incluirAlbaranes: this.incluirAlbaranes, etiqueta: etiqueta 
    }});
  }
  
  async doCheckbox() {
    let fechaNombreMes: Date = new Date(this.annoActual -1, this.mesActual);
    let etiquetaAnnoAnterior = fechaNombreMes.toLocaleDateString('es-ES', { month: 'long' }) + " " + (this.annoActual- 1);
    etiquetaAnnoAnterior = etiquetaAnnoAnterior.charAt(0).toUpperCase() + etiquetaAnnoAnterior.slice(1);
    
    let buttonsMeses = [{
      text : 'Cancelar'
    },
    {
      text: 'OK',
      handler: data => {
        this.mesSeleccionado = +data;
        if (this.mesSeleccionado == 12) {
          this.mesSeleccionado = this.mesActual;
          this.annoSeleccionado = this.annoActual -1;
        } else if (this.mesSeleccionado <= this.mesActual) {
          this.annoSeleccionado = this.annoActual
        } else {
          this.annoSeleccionado = this.annoActual - 1;
        }
        this.deshabilitarIncluirAlbaranes = this.mesActual != this.mesSeleccionado;
        let fechaNombreMes: Date = new Date(this.annoSeleccionado, this.mesSeleccionado);
        this.nombreMesSeleccionado = fechaNombreMes.toLocaleDateString('es-ES', { month: 'long' }) + " " + this.annoSeleccionado;
        this.incluirPicking = this.incluirPicking && !this.deshabilitarIncluirAlbaranes;
        if (this.incluirAlbaranes == this.deshabilitarIncluirAlbaranes) {
          this.incluirAlbaranes = !this.deshabilitarIncluirAlbaranes;
        } else {
          this.cargarResumen();
        }
      }      
    }];

    let alert = await this.alertCtrl.create({
      header : 'Seleccione el mes deseado',
      inputs: [{
        name: 'enero',
        type: 'radio',
        label: 'Enero',
        value: '0',
        checked: this.mesSeleccionado == 0
      },
      {
        name: 'febrero',
        type: 'radio',
        label: 'Febrero',
        value: '1',
        checked: this.mesSeleccionado == 1
      },
      {
        name: 'marzo',
        type: 'radio',
        label: 'Marzo',
        value: '2',
        checked: this.mesSeleccionado == 2
      },
      {
        name: 'abril',
        type: 'radio',
        label: 'Abril',
        value: '3',
        checked: this.mesSeleccionado == 3
      },
      {
        name: 'mayo',
        type: 'radio',
        label: 'Mayo',
        value: '4',
        checked: this.mesSeleccionado == 4
      },
      {
        name: 'junio',
        type: 'radio',
        label: 'Junio',
        value: '5',
        checked: this.mesSeleccionado == 5
      },
      {
        name: 'julio',
        type: 'radio',
        label: 'Julio',
        value: '6',
        checked: this.mesSeleccionado == 6
      },
      {
        name: 'agosto',
        type: 'radio',
        label: 'Agosto',
        value: '7',
        checked: this.mesSeleccionado == 7
      },
      {
        name: 'septiembre',
        type: 'radio',
        label: 'Septiembre',
        value: '8',
        checked: this.mesSeleccionado == 8
      },
      {
        name: 'octubre',
        type: 'radio',
        label: 'Octubre',
        value: '9',
        checked: this.mesSeleccionado == 9
      },
      {
        name: 'noviembre',
        type: 'radio',
        label: 'Noviembre',
        value: '10',
        checked: this.mesSeleccionado == 10
      },
      {
        name: 'diciembre',
        type: 'radio',
        label: 'Diciembre',
        value: '11',
        checked: this.mesSeleccionado == 11
      },
      {
        name: 'anterior',
        type: 'radio',
        label: etiquetaAnnoAnterior,
        value: '12',
        checked: this.mesSeleccionado == 12
      }],
      buttons: buttonsMeses
    });
    
    await alert.present().then(() => {
      this.testCheckboxOpen = true;
    });
  }

  colorRango(rojo: boolean): string {
    return rojo ? 'danger' : 'success';
  }
}
