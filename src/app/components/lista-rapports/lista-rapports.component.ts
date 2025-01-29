import { Component, ViewChild } from '@angular/core';
import { NativeGeocoderOptions, NativeGeocoder, NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';
import { NavController, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Usuario } from 'src/app/models/Usuario';
import { Events } from 'src/app/services/events.service';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';
import { SelectorBase } from '../selectorbase/selectorbase.component';
import { ListaRapportsService } from './lista-rapports.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics/ngx';


@Component({
  selector: 'app-lista-rapports',
  templateUrl: './lista-rapports.component.html',
  styleUrls: ['./lista-rapports.component.scss'],
})
export class ListaRapportsComponent extends SelectorBase {
  @ViewChild('clienteInput') myClienteInput;
  @ViewChild('buscarInput') myFiltroInput;
  @ViewChild('barraFiltrar') myBarraFiltrar;

  private nav: NavController;
  private servicio: ListaRapportsService;
  private alertCtrl: AlertController;
  private loadingCtrl: LoadingController;
  public segmentoRapports: string = 'cliente';
  
  private hoy: Date = new Date();
  private fechaYaAjustada: boolean;
  private _fechaRapports: string
  get fechaRapports(): string {
      return this._fechaRapports;
  }
  set fechaRapports(value: string) {
      this._fechaRapports = value;
      var date = new Date(value);
      var userTimezoneOffset = date.getTimezoneOffset() * 60000;
      var dateAjustada = new Date(date.getTime() - userTimezoneOffset);
      if (this.fechaYaAjustada) {
          this._fechaRapports = date.toISOString();
      } else {
        this._fechaRapports = dateAjustada.toISOString();
        this.fechaYaAjustada = true;
      }
  }
  public clienteRapport: string;
  public contactoRapport: string;
  public numeroCliente: string = "";
  public contactoSeleccionado: string = "";
  public mostrarDirecciones: boolean;

  public codigosPostalesSinVisitar: any;
  public vendedorSeleccionado: string;
  public listadoClientesSinVisitar: any;
  public listadoClientesSinVisitarFiltrado: any;
  private _codigoPostalSeleccionado: any;
  public filtro: string = "";
  public filtroBuscar: string = "";
  
  get codigoPostalSeleccionado() {
      return this._codigoPostalSeleccionado;
  }
  set codigoPostalSeleccionado(value: any) {
      this._codigoPostalSeleccionado = value;
      this.cargarClientesSinVisitar();
      setTimeout(() => {
          this.myBarraFiltrar.setFocus();
      }, 150);
      
  }

  // Variables de geolocalización
  geoLatitude: number;
  geoLongitude: number;
  geoAccuracy:number;
  //geoAddress: string;
  geoencoderOptions: NativeGeocoderOptions = {
    useLocale: true,
    maxResults: 5
  };

  generandoResumen = false;

  constructor(servicio: ListaRapportsService, nav: NavController, alertCtrl: AlertController, 
          loadingCtrl: LoadingController, public usuario: Usuario,
          private geolocation: Geolocation, private nativeGeocoder: NativeGeocoder,
          public events: Events,
          private firebaseAnalytics: FirebaseAnalytics, private toastController: ToastController) {
      super();
      this.servicio = servicio;
      this.nav = nav;
      this.alertCtrl = alertCtrl;
      this.loadingCtrl = loadingCtrl;
      this.clienteRapport = "";
      this.contactoRapport;
      this.vendedorSeleccionado = usuario.vendedor;
      this.fechaRapports = this.hoy.toISOString();//.slice(0, 10);

      events.subscribe('rapportCreado', (rapportCreado: any) => {
          if (!this.datosFiltrados) {
              this.datosFiltrados = [];
          }
          this.datosFiltrados.push(rapportCreado);
          if (this.listadoClientesSinVisitarFiltrado)
          {
              var clienteEncontrado = this.listadoClientesSinVisitarFiltrado
                  .find(p => p.cliente == rapportCreado.Cliente.trim() &&
                      p.contacto == rapportCreado.Contacto.trim());
              if (clienteEncontrado != undefined) {
                  this.listadoClientesSinVisitarFiltrado = this.listadoClientesSinVisitarFiltrado.filter(obj => obj !== clienteEncontrado);
              }
          }
          if (this.listadoClientesSinVisitar)
          {
              var clienteEncontrado = this.listadoClientesSinVisitar
                  .find(p => p.cliente == rapportCreado.Cliente.trim() &&
                      p.contacto == rapportCreado.Contacto.trim());
              if (clienteEncontrado != undefined) {
                  this.listadoClientesSinVisitar = this.listadoClientesSinVisitar.filter(obj => obj !== clienteEncontrado);
              }
          }
      });
  }

  public actualizarCliente(): void {
      if (this.numeroCliente == null || this.numeroCliente.trim() == "") {
          return;
      }
      this.clienteRapport = this.numeroCliente;
  }

  seleccionarCliente(cliente: string) {
    this.numeroCliente = cliente;
    this.actualizarCliente();
    this.segmentoRapports = "cliente";
  }

  public seleccionarContacto(evento: any): void {
      if (!this.clienteRapport) {
          return;
      }
      this.contactoSeleccionado = evento.contacto;
      this.cargarDatosCliente(this.clienteRapport, evento.contacto);
  }

  public cargarDatos(): void {
      //para que implemente el interface
  }

  public async cargarDatosFecha(fecha: string): Promise<void> {
      let loading: any = await this.loadingCtrl.create({
          message: 'Cargando Rapports...',
      });

      await loading.present();

      this.servicio.cargarListaFecha(fecha).subscribe(
          async data => {
              if (data.length === 0) {
                  let alert = await this.alertCtrl.create({
                      header: 'Error',
                      message: 'No hay ningún rapport para listar en esa fecha',
                      buttons: ['Ok'],
                  });
                  await alert.present();
              } else {
                  this.inicializarDatos(data);
              }
          },
          async error => {
              await loading.dismiss();
              this.errorMessage = <any>error;
          },
          async () => {
              await loading.dismiss();
          }
      );
  }

  public async cargarDatosCliente(cliente: string, contacto: string): Promise<void> {
      let loading: any = await this.loadingCtrl.create({
          message: 'Cargando Rapports...',
      });

      await loading.present();

      this.servicio.cargarListaCliente(cliente, contacto).subscribe(
          async data => {
              if (data.length === 0) {
                  let alert = await this.alertCtrl.create({
                      header: 'Error',
                      message: 'No hay ningún rapport de ese cliente para listar',
                      buttons: ['Ok'],
                  });
                  await alert.present();
              } else {
                  this.inicializarDatos(data);
              }
          },
          async error => {
              await loading.dismiss();
              this.errorMessage = <any>error;
          },
          async () => {
              await loading.dismiss();
          }
      );
  }


  public abrirRapport(rapport: any): void {
      this.nav.navigateForward('rapport', { queryParams:{ rapport: rapport }});
  }
  
  public annadirRapport(cliente: any) {
      let rapport: any = new Object();
      rapport.Id = 0;
      rapport.Fecha = this.fechaRapports;
      rapport.Empresa = Configuracion.EMPRESA_POR_DEFECTO;
      if (cliente) {
          rapport.Cliente = cliente.cliente;
          rapport.Contacto = cliente.contacto;
      }
      //rapport.Vendedor = this.usuario.vendedor; // tiene que ser el del cliente desde la API
      rapport.Tipo = "V"; // Visita
      rapport.Usuario = Configuracion.NOMBRE_DOMINIO + '\\' + this.usuario.nombre;
      rapport.TipoCentro = 0; // No se sabe
      rapport.Estado = 0; // Vigente
      this.firebaseAnalytics.logEvent("annadir_rapport", {cliente: rapport.Cliente, contacto: rapport.Contacto, fecha: rapport.Fecha});
      this.abrirRapport(rapport);
  }

  ionViewDidLoad() {
      setTimeout(() => {
          this.myClienteInput.setFocus();
      }, 150);
  }

  public cambiarSegmento(): void {
      if (this.segmentoRapports == 'fecha') {
          if (this.datosFiltrados == null || this.datosFiltrados.length == 0) {
              this.cargarDatosFecha(this.fechaRapports);
          }
      } else if (this.segmentoRapports == 'cliente') {
          setTimeout(() => {
              this.myClienteInput.setFocus();
          }, 150);
      } else if (this.segmentoRapports == 'codigoPostal' && this.usuario.vendedor) {
          this.cargarCodigosPostalesSinVisitar();
      } else if (this.segmentoRapports == 'buscar') {
          setTimeout(() => {
              this.myFiltroInput.setFocus();
          }, 150);
      }
  }

  seleccionarVendedor(vendedor: string) {
      this.firebaseAnalytics.logEvent("seleccionar_vendedor_rapport", {vendedor: vendedor});
      this.vendedorSeleccionado = vendedor;
      this.cargarCodigosPostalesSinVisitar();
  }
  
  async cargarCodigosPostalesSinVisitar(forzarTodos: boolean = false) {
      if (!this.vendedorSeleccionado) {
          return;
      }
      
      let loading: any = await this.loadingCtrl.create({
          message: 'Cargando Códigos Postales...',
      });

      await loading.present();

      this.servicio.cargarCodigosPostalesSinVisitar(this.vendedorSeleccionado, forzarTodos).subscribe(
          async data => {
              if (data.length === 0) {
                  let alert = await this.alertCtrl.create({
                      header: 'Error',
                      message: 'No hay ningún código postal sin visitar',
                      buttons: ['Ok'],
                  });
                  await alert.present();
              } else {
                  this.codigosPostalesSinVisitar = data;
                  this.getGeolocation();
              }
          },
          async error => {
              await loading.dismiss();
              this.errorMessage = <any>error;
          },
          async () => {
              await loading.dismiss();
          }
      );
  }

  async cargarClientesSinVisitar() {
      if (!this.vendedorSeleccionado) {
          return;
      }
      this.firebaseAnalytics.logEvent("rapport_clientes_sin_visitar", {vendedor: this.vendedorSeleccionado});
      
      let loading: any = await this.loadingCtrl.create({
          message: 'Cargando Clientes...',
      });

      await loading.present();

      this.servicio.cargarClientesSinVisitar(this.vendedorSeleccionado, this.codigoPostalSeleccionado).subscribe(
          async data => {
              if (data.length === 0) {
                  let alert = await this.alertCtrl.create({
                      header: 'Error',
                      message: 'No hay ningún cliente sin visitar',
                      buttons: ['Ok'],
                  });
                  this.listadoClientesSinVisitar = [];
                  this.listadoClientesSinVisitarFiltrado = [];
                  await alert.present();
              } else {
                  this.listadoClientesSinVisitar = data;
                  this.listadoClientesSinVisitarFiltrado = data;
              }
          },
          async error => {
              await loading.dismiss();
              this.errorMessage = <any>error;
          },
          async () => {
              await loading.dismiss();
          }
      );
  }

  public async mostrarFiltros() {
      let alert =  await this.alertCtrl.create({
        header: 'Seleccione el filtro deseado',
        inputs: [{
          type: 'radio',
          label: 'Solo C.P. sin visitas',
          value: 'filtrado',
          checked: true
        },
        {
          type: 'radio',
          label: 'Todos los C.P.',
          value: 'todos'
        }],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'OK',
            handler: (data:string) => { 
                if (data == 'todos')
                {
                    this.cargarCodigosPostalesSinVisitar(true);
                } else {
                    this.cargarCodigosPostalesSinVisitar();
                }
            }
          }
        ]
      });
      
      await alert.present();
  }

  cambiaFiltro(event: any) {
      var filtro = this.filtro.toUpperCase();
      function contieneCadena(element, index, array) { 
          return (element.cliente == filtro || element.nombre.toUpperCase().includes(filtro) || element.direccion.toUpperCase().includes(filtro)); 
      } 
      this.listadoClientesSinVisitarFiltrado = this.listadoClientesSinVisitar.filter(contieneCadena)
  }

  public async buscarRapports(): Promise<void> {
      let loading: any = await this.loadingCtrl.create({
          message: 'Cargando Rapports...',
      });

      await loading.present();

      this.servicio.cargarRapportsFiltrados(this.filtroBuscar).subscribe(
          async data => {
              if (data.length === 0) {
                  let alert = await this.alertCtrl.create({
                      header: 'Error',
                      message: 'No hay ningún rapport que incluya ese texto',
                      buttons: ['Ok'],
                  });
                  await alert.present();
              } else {
                  this.firebaseAnalytics.logEvent("buscar_rapport", {filtro: this.filtroBuscar});
                  this.inicializarDatos(data);
              }
          },
          async error => {
              await loading.dismiss();  
              this.errorMessage = <any>error;
          },
          async () => {
              await loading.dismiss();
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
          var codEncontrado = this.codigosPostalesSinVisitar.find(p => p.codigoPostal == result[0].postalCode);
          if (codEncontrado == undefined) {
              this.codigosPostalesSinVisitar.push({
                  codigoPostal : result[0].postalCode,
                  poblacion : '<< Ubicación Actual >>'
              });
          }
          this.codigoPostalSeleccionado = result[0].postalCode;
      })
      .catch((error: any) => {
          console.log('Error getting location'+ JSON.stringify(error));
      });
  }    

  resumirRapports() {
    if (this.generandoResumen) return; // Evita llamadas duplicadas
    this.generandoResumen = true; // Deshabilita el botón y cambia el texto
  
    this.servicio.cargarResumenRapports(this.numeroCliente, this.contactoSeleccionado)
      .subscribe(async (resumen) => {
        const resumenConSaltos = resumen.replace(/\n/g, '<br>');
  
        const alert = await this.alertCtrl.create({
          header: 'Resumen de Rapports',
          message: `<div style="max-height: 300px; overflow-y: auto;">${resumenConSaltos}</div>`,
          buttons: ['Cerrar']
        });
  
        await alert.present();
        this.generandoResumen = false; // Habilita el botón nuevamente
      }, 
      () => {
        this.generandoResumen = false; // En caso de error, también habilitamos el botón
      });
  }
  

  public inicializarLosDatos(datos:any[]) {
      super.inicializarDatos(datos);
  }
}
