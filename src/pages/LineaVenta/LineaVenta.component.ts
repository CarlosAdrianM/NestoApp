﻿import {Component} from '@angular/core';
import {NavParams, AlertController} from 'ionic-angular';
import {LineaVenta} from './LineaVenta';
import { LineaVentaService } from './LineaVenta.service';


@Component({
    templateUrl: 'LineaVenta.html',
})
export class LineaVentaComponent {
    
    public linea: LineaVenta;
    public errorMessage: string;
    private descuentoCadena: string;

    constructor(navParams: NavParams, private servicio: LineaVentaService, private alertCtrl: AlertController) {
        this.linea = navParams.get('linea');
        this.actualizarDescuento(this.linea.descuento * 100);
    }

    submitted = false;
    onSubmit() { this.submitted = true; }

    public actualizarDescuento(dto: any): void {
        if(isNaN(dto)) {
            dto = (String(dto)).replace(/[^\d.-]/g, '');
        }
        
        this.linea.descuento = dto / 100;
        this.descuentoCadena = dto + '%';
    }

    public cambiarProducto(evento): void {
        let nuevoProducto: string = evento.currentTarget.value;
        if (this.linea.producto == nuevoProducto) {
            return;
        }

        this.servicio.getProducto(nuevoProducto).subscribe(
            data => {
                if (data.length === 0) {
                    let alert: any = this.alertCtrl.create({
                        title: 'Error',
                        subTitle: 'No existe el producto ' + nuevoProducto,
                        buttons: ['Ok'],
                    });
                    alert.present();
                } else {
                    this.linea.producto = nuevoProducto;
                    this.linea.texto = data.nombre;
                    this.linea.precio = data.precio;
                    console.log("Producto cambiado");
                }
            },
            error => {
                // loading.dismiss();
                this.errorMessage = <any>error;
            },
            () => {
                // loading.dismiss();
            }
        );
    }

    public seleccionarTexto(evento: any): void {
        evento.target.select();
    }

}