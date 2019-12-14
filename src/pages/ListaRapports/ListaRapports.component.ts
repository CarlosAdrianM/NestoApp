import {Component, ViewChild} from '@angular/core';
import { NavController, AlertController, LoadingController, Events, Searchbar} from 'ionic-angular';
import { ListaRapportsService } from './ListaRapports.service';
import { SelectorBase } from '../../components/SelectorBase/SelectorBase';
import { Usuario } from '../../models/Usuario';
import { RapportComponent } from '../Rapport/Rapport.component';
import { Configuracion } from '../../components/configuracion/configuracion';
import { NativeGeocoderOptions, NativeGeocoder, NativeGeocoderReverseResult } from '@ionic-native/native-geocoder';
import { Geolocation } from '@ionic-native/geolocation';

@Component({
    templateUrl: 'ListaRapports.html',
})
export class ListaRapports extends SelectorBase {
    @ViewChild('clienteInput') myClienteInput;
    @ViewChild('barraFiltrar') myBarraFiltrar : Searchbar;

    private nav: NavController;
    private servicio: ListaRapportsService;
    private alertCtrl: AlertController;
    private loadingCtrl: LoadingController;
    public segmentoRapports: string = 'cliente';
    
    private hoy: Date = new Date();
    public fechaRapports: string = this.hoy.toISOString().slice(0, 10);
    public clienteRapport: string;
    public contactoRapport: string;
    public numeroCliente: string = "";
    public mostrarDirecciones: boolean;

    private codigosPostalesSinVisitar: any;
    public vendedorSeleccionado: string;
    public listadoClientesSinVisitar: any;
    public listadoClientesSinVisitarFiltrado: any;
    private _codigoPostalSeleccionado: any;
    public filtro: string;
    
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



    constructor(servicio: ListaRapportsService, nav: NavController, alertCtrl: AlertController, 
            loadingCtrl: LoadingController, private usuario: Usuario,
            private geolocation: Geolocation, private nativeGeocoder: NativeGeocoder,
            public events: Events) {
        super();
        this.servicio = servicio;
        this.nav = nav;
        this.alertCtrl = alertCtrl;
        this.loadingCtrl = loadingCtrl;
        this.clienteRapport = "";
        this.contactoRapport;
        this.vendedorSeleccionado = usuario.vendedor;

        events.subscribe('rapportCreado', (rapportCreado: any) => {
            if (!this.datosFiltrados) {
                this.datosFiltrados = [];
            }
            this.datosFiltrados.push(rapportCreado);
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

    public seleccionarContacto(evento: any): void {
        if (!this.clienteRapport) {
            return;
        }
        this.cargarDatosCliente(this.clienteRapport, evento.contacto);
    }

    public cargarDatos(): void {
        //para que implemente el interface
    }

    public cargarDatosFecha(fecha: string): void {
        let loading: any = this.loadingCtrl.create({
            content: 'Cargando Rapports...',
        });

        loading.present();

        this.servicio.cargarListaFecha(fecha).subscribe(
            data => {
                if (data.length === 0) {
                    let alert = this.alertCtrl.create({
                        title: 'Error',
                        subTitle: 'No hay ningún rapport para listar en esa fecha',
                        buttons: ['Ok'],
                    });
                    alert.present();
                } else {
                    this.inicializarDatos(data);
                }
            },
            error => {
                loading.dismiss();
                this.errorMessage = <any>error;
            },
            () => {
                loading.dismiss();
            }
        );
    }

    public cargarDatosCliente(cliente: string, contacto: string): void {
        let loading: any = this.loadingCtrl.create({
            content: 'Cargando Rapports...',
        });

        loading.present();

        this.servicio.cargarListaCliente(cliente, contacto).subscribe(
            data => {
                if (data.length === 0) {
                    let alert = this.alertCtrl.create({
                        title: 'Error',
                        subTitle: 'No hay ningún rapport de ese cliente para listar',
                        buttons: ['Ok'],
                    });
                    alert.present();
                } else {
                    this.inicializarDatos(data);
                }
            },
            error => {
                loading.dismiss();
                this.errorMessage = <any>error;
            },
            () => {
                loading.dismiss();
            }
        );
    }


    public abrirRapport(rapport: any): void {
        this.nav.push(RapportComponent, { rapport: rapport });
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
        }
    }

    seleccionarVendedor(vendedor: string) {
        this.vendedorSeleccionado = vendedor;
        this.cargarCodigosPostalesSinVisitar();
    }
    
    cargarCodigosPostalesSinVisitar(forzarTodos: boolean = false) {
        if (!this.vendedorSeleccionado) {
            return;
        }
        
        let loading: any = this.loadingCtrl.create({
            content: 'Cargando Códigos Postales...',
        });

        loading.present();

        this.servicio.cargarCodigosPostalesSinVisitar(this.vendedorSeleccionado, forzarTodos).subscribe(
            data => {
                if (data.length === 0) {
                    let alert = this.alertCtrl.create({
                        title: 'Error',
                        subTitle: 'No hay ningún código postal sin visitar',
                        buttons: ['Ok'],
                    });
                    alert.present();
                } else {
                    this.codigosPostalesSinVisitar = data;
                    this.getGeolocation();
                }
            },
            error => {
                loading.dismiss();
                this.errorMessage = <any>error;
            },
            () => {
                loading.dismiss();
            }
        );
    }

    cargarClientesSinVisitar() {
        if (!this.vendedorSeleccionado) {
            return;
        }
        
        let loading: any = this.loadingCtrl.create({
            content: 'Cargando Clientes...',
        });

        loading.present();

        this.servicio.cargarClientesSinVisitar(this.vendedorSeleccionado, this.codigoPostalSeleccionado).subscribe(
            data => {
                if (data.length === 0) {
                    let alert = this.alertCtrl.create({
                        title: 'Error',
                        subTitle: 'No hay ningún cliente sin visitar',
                        buttons: ['Ok'],
                    });
                    alert.present();
                } else {
                    this.listadoClientesSinVisitar = data;
                    this.listadoClientesSinVisitarFiltrado = data;
                }
            },
            error => {
                loading.dismiss();
                this.errorMessage = <any>error;
            },
            () => {
                loading.dismiss();
            }
        );
    }

    public mostrarFiltros() {
        let alert = this.alertCtrl.create();
        alert.setTitle('Seleccione el filtro deseado');

        alert.addInput({
            type: 'radio',
            label: 'Solo C.P. sin visitas',
            value: 'filtrado',
            checked: true
        });

        alert.addInput({
            type: 'radio',
            label: 'Todos los C.P.',
            value: 'todos'
        });

        alert.addButton({
            text: 'Cancelar',
            role: 'cancel'
        });
        alert.addButton({
            text: 'OK',
            handler: (data:string) => { 
                if (data == 'todos')
                {
                    this.cargarCodigosPostalesSinVisitar(true);
                } else {
                    this.cargarCodigosPostalesSinVisitar();
                }
            }
        });
        
        alert.present();
    }

    cambiaFiltro(event: any) {
        var filtro = this.filtro.toUpperCase();
        function contieneCadena(element, index, array) { 
            return (element.cliente == filtro || element.nombre.toUpperCase().includes(filtro) || element.direccion.toUpperCase().includes(filtro)); 
        } 
        this.listadoClientesSinVisitarFiltrado = this.listadoClientesSinVisitar.filter(contieneCadena)
    }


    
    public colorEstado(estado: number): string {
        if (estado == 0 || estado == 9) {
            return "secondary";
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
        .then((result: NativeGeocoderReverseResult[]) => {
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
}
