import { Component, ViewChild } from '@angular/core';
import { AlertController, NavController, ModalController } from '@ionic/angular';
import { Usuario } from 'src/app/models/Usuario';
import { Events } from 'src/app/services/events.service';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';
import { ClienteService } from './cliente.service';
import { ClientesMismoTelefonoComponent } from './clientes-mismo-telefono';
import { NativeGeocoder, NativeGeocoderOptions, NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ActivatedRoute } from '@angular/router';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics/ngx';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.scss'],
})
export class ClienteComponent {

  DATOS_FISCALES: number = 0;
  DATOS_GENERALES: number = 1;
  DATOS_COMISIONES: number = 2;
  DATOS_PAGO: number = 3;
  DATOS_CONTACTO : number = 4;

  constructor(
      private servicio: ClienteService, 
      private alertCtrl: AlertController,
      private geolocation: Geolocation,
      private nativeGeocoder: NativeGeocoder,
      private usuario: Usuario,
      private nav: NavController,
      public modalCtrl: ModalController,
      public events: Events,
      private route: ActivatedRoute,
      private firebaseAnalytics: FirebaseAnalytics
  ){
      if (this.route.snapshot.queryParams && this.route.snapshot.queryParams.empresa &&
        this.route.snapshot.queryParams.cliente && this.route.snapshot.queryParams.contacto) {
          this.servicio.leerClienteCrear(
            this.route.snapshot.queryParams.empresa, 
            this.route.snapshot.queryParams.cliente,
            this.route.snapshot.queryParams.contacto
          ).subscribe(
              data => {
                  this.cliente = data;
                  this.cliente.usuario = Configuracion.NOMBRE_DOMINIO + '\\' + this.usuario.nombre;
                  this.cliente.esUnaModificacion = true;
              },
              async error => {
                  let alert = await this.alertCtrl.create({
                      message: 'Error',
                      subHeader: 'No se ha podido cargar el cliente:\n' + error.ExceptionMessage,
                      buttons: ['Ok'],
                  });
                  await alert.present();
              }
          )
          if (!this.cliente.personasContacto) {
              this.cliente.personasContacto = [];
          }
      } else {
          this.cliente.esUnaModificacion = false;
          this.getGeolocation();
          this.annadirPersonaContacto();
      }

      if (this.route.snapshot.queryParams && this.route.snapshot.queryParams.nif && this.route.snapshot.queryParams.nombre) {
          this.cliente.nif = this.route.snapshot.queryParams.nif;
          this.cliente.nombre = this.route.snapshot.queryParams.nombre;
          this.goToDatosGenerales();
      } 
  }

  @ViewChild('iban') inputIban;
  @ViewChild('nif') inputNif;
  private inputDireccion: any;
  @ViewChild('direccion') set direccionProp(direccionProp:any) {
      this.inputDireccion = direccionProp;
  };

  slideActual: number = 0;

  cliente: any = {
      formaPago: "EFC",
      plazosPago: "CONTADO",
      personasContacto : [],
      iban: "",
      usuario: Configuracion.NOMBRE_DOMINIO + '\\' + this.usuario.nombre,
  };

  datosPagoValidados: boolean = false;
  
  mensajeDatosFiscales: string = "";

  // Variables de geolocalización
  geoLatitude: number;
  geoLongitude: number;
  geoAccuracy:number;
  //geoAddress: string;
  geoencoderOptions: NativeGeocoderOptions = {
    useLocale: true,
    maxResults: 5
  };

  ngAfterViewInit() {
      setTimeout(()=>{
          if (this.slideActual == this.DATOS_FISCALES){
              this.inputNif.setFocus();
          }
      },500)
  }

  annadirPersonaContacto() {
      var persona = {};
      this.cliente.personasContacto.push(persona);
  }

  borrarPersonaContacto(persona: any) {
      var index = this.cliente.personasContacto.indexOf(persona);
      if (index !== -1) this.cliente.personasContacto.splice(index, 1);
  }

  nombreDisabled(): boolean {
      return !this.cliente.nifValidado && this.cliente.nif 
          && '0123456789YX'.indexOf(this.cliente.nif.toUpperCase().trim()[0]) == -1;
  }
  
  goToDatosGenerales() {
      if (this.cliente.nifValidado) {
          this.pasarADatosGenerales();
          return;
      };
      if (!this.cliente.nif) {
          this.cliente.estado = 5;
          this.cliente.nifValidado;
          this.pasarADatosGenerales();
          return;
      }
      if (this.nombreDisabled()) {
          this.cliente.nombre=undefined;
      }
      this.servicio.validarNif(this.cliente.nif, this.cliente.nombre).subscribe(
          data => {
              if (data.nifFormateado != "UNDEFINED") {
                  this.cliente.nif = data.nifFormateado;
              }
              this.cliente.nombre = data.nombreFormateado;
              this.cliente.esContacto = data.existeElCliente;
              if (data.existeElCliente) {
                  this.cliente.empresa = data.empresa;
                  this.cliente.cliente = data.numeroCliente;
                  this.cliente.contacto = data.contacto;
              }
              this.cliente.estado = data.estadoCliente;
              this.cliente.nifValidado = data.nifValidado;
              
              if (data.nifValidado) {
                  this.pasarADatosGenerales();
                  this.mensajeDatosFiscales = "El NIF ya está validado, pero todavía puede modificar el nombre manualmente";
              } else {
                  this.mensajeDatosFiscales = "Error en el nombre o NIF, debe corregirlo para poder continuar";
              }
          },
          async error => {
              let alert = await this.alertCtrl.create({
                  message: 'Error',
                  subHeader: 'No se ha podido validar el NIF:\n' + error.ExceptionMessage,
                  buttons: ['Ok'],
              });
              await alert.present();
          }
      )    
  }

  private pasarADatosGenerales() {
      this.slideActual = this.DATOS_GENERALES;
      setTimeout(() => {
          this.inputDireccion.setFocus();
      }, 500);
  }

  goToDatosComisiones() {
      if (this.cliente.telefono == 'undefined') {
          this.cliente.telefono = '';
      }
      /*
      if (this.cliente.direccionValidada) {
          this.slideActual = this.DATOS_COMISIONES;
          return;
      }
      */
      this.servicio.validarDatosGenerales(this.cliente).subscribe(
          async data => {
              this.cliente.direccion = data.direccionFormateada;
              if (this.cliente.direccionAdicional) {
                  this.cliente.direccion += ", " + this.cliente.direccionAdicional.toUpperCase();
              }
              this.cliente.direccion = this.cliente.direccion.substr(0, 50);
              this.cliente.poblacion = data.poblacion;
              this.cliente.provincia = data.provincia;
              this.cliente.ruta = data.ruta;
              this.cliente.telefono = data.telefonoFormateado;
              this.cliente.vendedorEstetica = data.vendedorEstetica;
              this.cliente.vendedorPeluqueria = data.vendedorPeluqueria;
              if (!data.hayErrores) {
                  this.cliente.direccionValidada = true;
                  this.slideActual = this.DATOS_COMISIONES;
              }
              if (data.clientesMismoTelefono && data.clientesMismoTelefono.length > 0) {
                  data.clientesMismoTelefono = data.clientesMismoTelefono.filter(c => c.cliente != this.cliente.cliente);
              }
              if (data.clientesMismoTelefono && data.clientesMismoTelefono.length > 0) {
                  let clientesModal = await this.modalCtrl.create({
                    component: ClientesMismoTelefonoComponent, 
                    componentProps: { listaClientes: data.clientesMismoTelefono }
                  });
                  await clientesModal.present();
              }
          },
          async error => {
              let alert = await this.alertCtrl.create({
                  header: 'Error',
                  message: 'No se ha podido validar la dirección:\n' + error.ExceptionMessage,
                  buttons: ['Ok'],
              });
              await alert.present();
          }
      )
  }

  goToDatosPago() {
      this.slideActual = this.DATOS_PAGO;
  }

  goToDatosContacto() {
      var datosPago: any = {
          formaPago: this.cliente.formaPago,
          ibanBruto: this.cliente.iban,
          plazosPago: this.cliente.plazosPago
      }
      this.servicio.validarDatosPago(datosPago).subscribe( 
      async data => {
          this.cliente.iban = data.ibanFormateado;
          if (data.datosPagoValidos) {
              this.slideActual = this.DATOS_CONTACTO;
          } else if (!data.ibanValido) {
              let alert = await this.alertCtrl.create({
                  message: 'Error',
                  subHeader: 'IBAN no válido',
                  buttons: ['Ok'],
              });
              await alert.present();
          } else {
              let alert = await this.alertCtrl.create({
                  message: 'Error',
                  subHeader: 'Error en los datos de pago',
                  buttons: ['Ok'],
              });
              await alert.present();
          }
      },
      async error => {
          let alert = await this.alertCtrl.create({
              message: 'Error',
              subHeader: 'Error en la validación del IBAN:\n' + error.ExceptionMessage,
              buttons: ['Ok'],
          });
          await alert.present();
      })
  }

  finalizar() {
      if (this.cliente.formaPago == "EFC") {
          this.cliente.iban = "";
      }
      if (this.cliente.esUnaModificacion) {
          this.modificarCliente();
          this.nav.pop();
      } else {
          this.crearCliente();
      }
  }

  crearCliente() {
      this.servicio.crearCliente(this.cliente).subscribe(
          async data => {
              this.firebaseAnalytics.logEvent("crear_cliente", {cliente: data.Nº_Cliente, contacto: data.Contacto});
              let alert = await this.alertCtrl.create({
                  message: 'Cliente',
                  subHeader: 'Se ha creado correctamente el cliente: ' 
                  + data.Nº_Cliente + '/'+data.Contacto,
                  buttons: ['Ok'],
              });
              await alert.present();
              this.cliente = {
                  formaPago: "EFC",
                  plazosPago: "CONTADO",
                  personasContacto : [],
                  iban: "",
                  usuario: Configuracion.NOMBRE_DOMINIO + '\\' + this.usuario.nombre,
              };
              this.mensajeDatosFiscales = "";
              this.slideActual = this.DATOS_FISCALES;
              
          },
          async error => {
              var textoExcepcion: string = error.ExceptionMessage;
              var subError: any = error;
              while (subError.InnerException) {
                  subError = subError.InnerException;
                  if (subError.ExceptionMessage != 
                      "An error occurred while updating the entries. See the inner exception for details.") {
                      textoExcepcion += "\n" + subError.ExceptionMessage;
                  }
              }
              let alert = await this.alertCtrl.create({
                  message: 'Error',
                  subHeader: 'No se ha podido crear el cliente:\n' + textoExcepcion,
                  buttons: ['Ok'],
              });
              await alert.present();
             }
      )
  }

  modificarCliente() {
      this.servicio.modificarCliente(this.cliente).subscribe(
          async data => {
            this.firebaseAnalytics.logEvent("modificar_cliente", {cliente: data.Nº_Cliente, contacto: data.Contacto});
              let alert = await this.alertCtrl.create({
                  message: 'Cliente',
                  subHeader: 'Se ha modificado correctamente el cliente: ' 
                  + data.Nº_Cliente + '/'+data.Contacto,
                  buttons: ['Ok'],
              });
              await alert.present();
              this.events.publish('clienteModificado', {
                  empresa: data.Empresa.trim(),
                  cliente: data.Nº_Cliente.trim(),
                  contacto: data.Contacto.trim(),
                  cifNif: data.CIF_NIF,
                  nombre: data.Nombre,
                  direccion: data.Dirección,
                  codigoPostal: data.CodPostal,
                  poblacion: data.Población,
                  provincia: data.Provincia,
                  comentarios: data.Comentarios,
                  telefono: data.Teléfono,
                  estado: data.Estado
              });
              this.cliente = {
                  formaPago: "EFC",
                  plazosPago: "CONTADO",
                  personasContacto : [],
                  iban: "",
                  usuario: Configuracion.NOMBRE_DOMINIO + '\\' + this.usuario.nombre,
              };
          },
          async error => {
              var textoExcepcion: string = error.ExceptionMessage;
              var subError: any = error;
              while (subError.InnerException) {
                  subError = subError.InnerException;
                  if (subError.ExceptionMessage != 
                      "An error occurred while updating the entries. See the inner exception for details.") {
                      textoExcepcion += "\n" + subError.ExceptionMessage;
                  }
              }
              let alert = await this.alertCtrl.create({
                  message: 'Error',
                  subHeader: 'No se ha podido modificar el cliente:\n' + textoExcepcion,
                  buttons: ['Ok'],
              });
              await alert.present();
          }
      )
  }

  seleccionarFormaPago(event: any) {
      this.cliente.formaPago = event;
      if (this.cliente.formaPago == "RCB") {
          setTimeout(() => {
              this.inputIban.setFocus();
          }, 500);
      }
  }

  // Funciones de geolocalización
  //Get current coordinates of device
  getGeolocation(){
      this.geolocation.getCurrentPosition().then((resp) => {
      this.geoLatitude = resp.coords.latitude;
      this.geoLongitude = resp.coords.longitude; 
      this.geoAccuracy = resp.coords.accuracy; 
      this.getGeoencoder(this.geoLatitude,this.geoLongitude);
      }).catch((error) => {
          console.log('Error getting location'+ JSON.stringify(error));
      });
  }

  //geocoder method to fetch address from coordinates passed as arguments
  getGeoencoder(latitude,longitude){
      this.nativeGeocoder.reverseGeocode(latitude, longitude, this.geoencoderOptions)
      .then((result: NativeGeocoderResult[]) => {
          this.cliente.codigoPostal = result[0].postalCode;
          this.cliente.direccionCalleNumero = (result[0].thoroughfare || "") +
               " " +(result[0].subThoroughfare || "")
      })
      .catch((error: any) => {
          console.log('Error getting location'+ JSON.stringify(error));
      });
  }        

  public seleccionarTexto(evento: any): void {
    var nativeInputEle = evento.target;
    nativeInputEle.getInputElement().then(
      a => a.select()
    )
  }
}
