import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { ProductoComponent } from '../producto/producto.component';
import { LineaVenta } from './linea-venta';
import { LineaVentaService } from './linea-venta.service';

@Component({
  selector: 'app-linea-venta',
  templateUrl: './linea-venta.component.html',
  styleUrls: ['./linea-venta.component.scss'],
})
export class LineaVentaComponent {
    
  public linea: LineaVenta;
  private cliente: string;
  private contacto: string;
  public errorMessage: string;
  public descuentoCadena: string;

constructor(
  private servicio: LineaVentaService, 
  private alertCtrl: AlertController, 
  private nav: NavController,
  private route: ActivatedRoute
  ) {
      this.linea = this.route.snapshot.queryParams.linea;
      this.cliente = this.route.snapshot.queryParams.cliente;
      this.contacto = this.route.snapshot.queryParams.contacto;
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
      let nuevoProducto: string = evento.value;
      if (this.linea.producto == nuevoProducto) {
          return;
      }

      this.servicio.getProducto(nuevoProducto, this.cliente, this.contacto, this.linea.cantidad).subscribe(
          async data => {
              if (data.length === 0) {
                  let alert: any = await this.alertCtrl.create({
                      header: 'Error',
                      message: 'No existe el producto ' + nuevoProducto,
                      buttons: ['Ok'],
                  });
                  await alert.present();
              } else {
                  this.linea.producto = nuevoProducto;
                  this.linea.precio = data.precio;
                  this.linea.texto = data.nombre;
                  this.linea.aplicarDescuento = data.aplicarDescuento;
                  this.linea.descuentoProducto = data.descuento;
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

  public abrirProducto(): void {
    this.nav.navigateForward('producto', { queryParams: { empresa: "1", producto: this.linea.producto }});
  }

  public seleccionarTexto(evento: any): void {
    var nativeInputEle = evento.target;
    nativeInputEle.getInputElement().then(
      a => a.select()
    )
  }
}
