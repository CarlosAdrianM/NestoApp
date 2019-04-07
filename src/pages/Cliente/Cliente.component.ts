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
import { Component, ViewChild } from '@angular/core';
import { ClienteService } from './Cliente.service';

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

    @ViewChild('iban') inputIban ;

    slideActual: number = 0;

    cliente: any = {
        formaPago: "EFC",
        plazosPago: "CONTADO",
        personasContacto : [],
        iban: ""
    };

    annadirPersonaContacto() {
        var persona = {};
        this.cliente.personasContacto.push(persona);
    }

    goToDatosGenerales() {
        this.servicio.validarNif(this.cliente.nif).subscribe(
            data => {
                if (data.nifValidado) {
                    this.cliente.esContacto = data.existeElCliente;
                    this.slideActual = this.DATOS_GENERALES;
                }
            }
        )
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
        var datosPago: any = {
            formaPago: this.cliente.formaPago,
            ibanBruto: this.cliente.iban,
            plazosPago: this.cliente.plazosPago
        }
        this.servicio.validarDatosPago(datosPago).subscribe( data => {
            if (data.datosPagoValidos) {
                this.cliente.iban = data.ibanFormateado;
                this.slideActual = this.DATOS_CONTACTO;
            }
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
}  