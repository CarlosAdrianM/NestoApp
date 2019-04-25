/*
CIF_NIF -> comprobar si existe
¿Es cliente nuevo dirección de entrega de uno ya existente?
Si no lo tenemos -> Estado 5
Dependiendo del vendedor, estado 0 o 9
Si es dirección de entrega, estado 7

Datos generales:
Nombre (formatear con la forma juridica del CIF)
Direccion (formatear con C/, AV. etc...)
CodigoPostal -> SelectorCodigosPostales
Telefono -> comprobar si es otro cliente

Comisiones:
Si es dirección de entrega, copiar las del cliente principal
Checkbox: ¿tiene estética?
Checkbox: ¿tiene peluquería?
Vendedor / VendedorPeluquería -> Auto. ¿Pueden Cambiar?

Pago: 
Si es dirección de entrega, por defecto copiar las del cliente principal
Forma de pago -> si es recibo, pedir CCC
CCC -> lo validamos en la api, solo mandamos cadena sin formatear
Mandato -> foto, creamos PDF
Plazos de Pago -> si tiene CCC se puede solicitar autorización para poner 30 días.

Personas de contacto:
Nombre
Cargo -> ¿Selector Cargos? ¿Constante?
Email
Telefono


DireccionesDeEntrega -> crear de nuevo como otro cliente

*/
import { Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { ClienteService } from './Cliente.service';
import { TextInput } from 'ionic-angular';

@Component({
    templateUrl: 'Cliente.html',
})
export class ClienteComponent {
    DATOS_FISCALES: number = 0;
    DATOS_GENERALES: number = 1;
    DATOS_COMISIONES: number = 2;
    DATOS_PAGO: number = 3;
    DATOS_CONTACTO : number = 4;

    constructor(private servicio: ClienteService){}

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

    validarDatosPago() {
        var datosPago: any = {
            formaPago: this.cliente.formaPago,
            ibanBruto: this.cliente.iban,
            plazosPago: this.cliente.plazosPago
        }
        this.servicio.validarDatosPago(datosPago).subscribe( data => {
            this.datosPagoValidados = data.ibanValido && data.datosPagoValidos;
            if (data.datosPagoValidos) {
                this.cliente.iban = data.ibanFormateado;
            }
        })
    }

    nombreDisabled(): boolean {
        return !this.cliente.nifValidado && this.cliente.nif 
            && '0123456789YX'.indexOf(this.cliente.nif.toUpperCase().trim()[0]) == -1;
    }
    
    goToDatosGenerales() {
        if (this.cliente.nifValidado) {
            this.slideActual = this.DATOS_GENERALES;
            setTimeout(()=>{
                this.inputDireccion._native.nativeElement.focus();
            },500);
        } else {
            this.servicio.validarNif(this.cliente.nif, this.cliente.nombre).subscribe(
                data => {
                    this.cliente.nif = data.nifFormateado;
                    this.cliente.nombre = data.nombreFormateado;
                    this.cliente.esContacto = data.existeElCliente;
                    this.cliente.nifValidado = data.nifValidado;
                    
                    if (data.nifValidado) {
                        this.slideActual = this.DATOS_GENERALES;
                        setTimeout(()=>{
                            this.inputDireccion._native.nativeElement.focus();
                        },500);
                        this.mensajeDatosFiscales = "El NIF ya está validado, pero puede modificar el nombre manualmente";
                    } else {
                        this.mensajeDatosFiscales = "Error en el nombre o NIF, debe corregirlo para poder continuar";
                    }
                }
            )    
        }
    }

    goToDatosComisiones() {
        this.servicio.validarDatosGenerales(this.cliente).subscribe(
            data => {
                if (!data.hayErrores) {
                    this.cliente.nombre = data.nombre;
                    this.cliente.direccion = data.direccion;
                    this.cliente.poblacion = data.poblacion;
                    this.cliente.provincia = data.provincia;
                    this.cliente.telefono = data.telefono;
                    this.cliente.vendedorEstetica = data.vendedorEstetica;
                    this.cliente.vendedorPeluqueria = data.vendedorPeluqueria;
                    this.slideActual = this.DATOS_COMISIONES;
                }
            }
        )
    }

    goToDatosPago() {
        this.slideActual = this.DATOS_PAGO;
    }

    goToDatosContacto() {
        if (this.datosPagoValidados || this.cliente.formaPago != 'RCB') {
            this.slideActual = this.DATOS_CONTACTO;
        }
    }

    seleccionarFormaPago(event: any) {
        this.cliente.formaPago = event;
        if (this.cliente.formaPago == "RCB") {
            setTimeout(() => {
                this.inputIban.setFocus();
            }, 500);
        }
    }
}  