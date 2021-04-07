import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { LoadingController, AlertController, NavController } from '@ionic/angular';
import { SelectorBase } from '../selectorbase/selectorbase.component';
import { SelectorClientesService } from './selector-clientes.service';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { Events } from 'src/app/services/events.service';
import { Router } from '@angular/router';

@Component({
  selector: 'selector-clientes',
  templateUrl: './selector-clientes.component.html',
  styleUrls: ['./selector-clientes.component.scss'],
})
export class SelectorClientesComponent extends SelectorBase {

  @Output() seleccionar = new EventEmitter();
  private servicio: SelectorClientesService;
  private loadingCtrl: LoadingController;
  private alertCtrl: AlertController;

  constructor(servicio: SelectorClientesService, loadingCtrl: LoadingController, 
      alertCtrl: AlertController, private keyboard: Keyboard, private router: Router,
      public events: Events) {
      super();
      this.servicio = servicio;
      this.loadingCtrl = loadingCtrl;
      this.alertCtrl = alertCtrl;

      events.subscribe('clienteModificado', (clienteModificado: any) => {
          this.actualizarCliente(clienteModificado);
      });
  }

  @ViewChild('barra') myIonSearchBar;
  


  public setFocus(): void {
      setTimeout(() => {
          this.myIonSearchBar.setFocus();
          this.keyboard.show();
      }, 0);
  }

  public async cargarDatos(filtro: string): Promise<void> {
      let loading: any = await this.loadingCtrl.create({
          message: 'Cargando Clientes...',
      });

      await loading.present();

      this.servicio.getClientes(filtro).subscribe(
          async data => {
            await loading.dismiss();
              if (data.length === 0) {
                  let alert: any = await this.alertCtrl.create({
                      header: 'Error',
                      message: 'No se encuentra ningún cliente que coincida con ' + filtro,
                      buttons: ['Ok'],
                  });
                  await alert.present();
                  await alert.onDidDismiss();
              } else {
                  this.inicializarDatos(data);
              }
              this.setFocus();
          },
          async error => {
              // loading.dismiss();
              this.errorMessage = <any>error;
              await loading.dismiss();
          },
          () => {
            
          }
      );
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

  crearContacto(event: Event, cliente: any): void {
      event.stopPropagation();
      if (cliente.cifNif == null) {
          return;
      }
      this.router.navigate(['cliente'], { queryParams: { 
          nif: cliente.cifNif,
          nombre: cliente.nombre
      }})
  }

  editarContacto(event: Event, cliente: any): void {
    event.stopPropagation();
    if (cliente.cifNif == null) {
        return;
    }
    this.router.navigate(['cliente'], { queryParams: { 
        empresa: cliente.empresa,
        cliente: cliente.cliente,
        contacto: cliente.contacto
    }})
}

  annadirCliente(event: Event): void {
      event.stopPropagation();
      this.router.navigate(['cliente']);
  }

  actualizarCliente(clienteModificado: any) {
      if (!this.datosFiltrados) {
          return;
      }
      var clienteEncontrado = this.datosFiltrados.filter(c => c.empresa == clienteModificado.empresa && c.cliente == clienteModificado.cliente && c.contacto == clienteModificado.contacto)[0];
      if (clienteEncontrado) {
          clienteEncontrado.cifNif = clienteModificado.cifNif;
          clienteEncontrado.nombre = clienteModificado.nombre;
          clienteEncontrado.direccion = clienteModificado.direccion;
          clienteEncontrado.codigoPostal = clienteModificado.codigoPostal;
          clienteEncontrado.poblacion = clienteModificado.poblacion;
          clienteEncontrado.provincia = clienteModificado.provincia;
          clienteEncontrado.comentarios = clienteModificado.comentarios;
          clienteEncontrado.telefono = clienteModificado.telefono;
          clienteEncontrado.estado = clienteModificado.estado;
      }
  }
}
