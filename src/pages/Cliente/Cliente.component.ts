/*
Dependiendo del vendedor, estado 0 o 9
Si es dirección de entrega, estado 7

Datos generales:
Nombre (formatear con la forma juridica del CIF)
CodigoPostal -> SelectorCodigosPostales
Telefono -> comprobar si es otro cliente

Comisiones:
Si es dirección de entrega, copiar las del cliente principal

Pago: 
Si es dirección de entrega, por defecto copiar las del cliente principal
CCC -> lo validamos en la api, solo mandamos cadena sin formatear
Mandato -> foto, creamos PDF
Plazos de Pago -> si tiene CCC se puede solicitar autorización para poner 30 días.

Personas de contacto:
Cargo -> ¿Selector Cargos? ¿Constante?
Telefono
*/
import { Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { ClienteService } from './Cliente.service';
import { TextInput, AlertController } from 'ionic-angular';
import { NativeGeocoder, NativeGeocoderReverseResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder';
import { Geolocation } from '@ionic-native/geolocation';


@Component({
    templateUrl: 'Cliente.html',
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
        private nativeGeocoder: NativeGeocoder
    ){
        this.getGeolocation();
    }

    @ViewChild('iban') inputIban;
    @ViewChild('nif') inputNif;
    private inputDireccion: TextInput;
    @ViewChild('direccion') set direccionProp(direccionProp:TextInput) {
        this.inputDireccion = direccionProp;
    };

    slideActual: number = 0;

    cliente: any = {
        formaPago: "EFC",
        plazosPago: "CONTADO",
        personasContacto : [],
        iban: ""
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
            this.inputNif.setFocus();
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
        } else {
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
                    this.cliente.nifValidado = data.nifValidado;
                    
                    if (data.nifValidado) {
                        this.pasarADatosGenerales();
                        this.mensajeDatosFiscales = "El NIF ya está validado, pero todavía puede modificar el nombre manualmente";
                    } else {
                        this.mensajeDatosFiscales = "Error en el nombre o NIF, debe corregirlo para poder continuar";
                    }
                },
                error => {
                    let alert = this.alertCtrl.create({
                        title: 'Error',
                        subTitle: 'No se ha podido validar el NIF:\n' + error.exceptionMessage,
                        buttons: ['Ok'],
                    });
                    alert.present();
                }
            )    
        }
    }

    private pasarADatosGenerales() {
        this.slideActual = this.DATOS_GENERALES;
        setTimeout(() => {
            this.inputDireccion._native.nativeElement.focus();
        }, 500);
    }

    goToDatosComisiones() {
        if (this.cliente.direccionValidada) {
            this.slideActual = this.DATOS_COMISIONES;
        }
        this.servicio.validarDatosGenerales(this.cliente).subscribe(
            data => {
                if (!this.cliente.direccionValidada) {
                    this.cliente.direccion = data.direccionFormateada;
                    this.cliente.poblacion = data.poblacion;
                    this.cliente.provincia = data.provincia;
                    this.cliente.telefono = data.telefono;
                    this.cliente.vendedorEstetica = data.vendedorEstetica;
                    this.cliente.vendedorPeluqueria = data.vendedorPeluqueria;
                }
                if (!data.hayErrores) {
                    this.cliente.direccionValidada = true;
                    this.slideActual = this.DATOS_COMISIONES;
                }
            },
            error => {
                let alert = this.alertCtrl.create({
                    title: 'Error',
                    subTitle: 'No se ha podido validar la dirección:\n' + error.exceptionMessage,
                    buttons: ['Ok'],
                });
                alert.present();
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
        data => {
            this.cliente.iban = data.ibanFormateado;
            if (data.datosPagoValidos) {
                this.slideActual = this.DATOS_CONTACTO;
            } else if (!data.ibanValido) {
                let alert = this.alertCtrl.create({
                    title: 'Error',
                    subTitle: 'IBAN no válido',
                    buttons: ['Ok'],
                });
                alert.present();
            } else {
                let alert = this.alertCtrl.create({
                    title: 'Error',
                    subTitle: 'Error en los datos de pago',
                    buttons: ['Ok'],
                });
                alert.present();
            }
        },
        error => {
            let alert = this.alertCtrl.create({
                title: 'Error',
                subTitle: 'Error en la validación del IBAN:\n' + error.exceptionMessage,
                buttons: ['Ok'],
            });
            alert.present();
        })
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
        //alert('Error getting location'+ JSON.stringify(error));
        });
    }

    //geocoder method to fetch address from coordinates passed as arguments
    getGeoencoder(latitude,longitude){
        this.nativeGeocoder.reverseGeocode(latitude, longitude, this.geoencoderOptions)
        .then((result: NativeGeocoderReverseResult[]) => {
            this.cliente.codigoPostal = result[0].postalCode;
            this.cliente.direccion = (result[0].thoroughfare || "") +
                 " " +(result[0].subThoroughfare || "")
        })
        .catch((error: any) => {
            //alert('Error getting location'+ JSON.stringify(error));
        });
    }        
}  