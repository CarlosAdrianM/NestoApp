import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics/ngx';
import { AlertController, NavController } from '@ionic/angular';
import { ProductoComponent } from '../producto/producto.component';
import { LineaVenta } from './linea-venta';
import { LineaVentaService } from './linea-venta.service';

@Component({
  selector: 'app-linea-venta',
  templateUrl: './linea-venta.component.html',
  styleUrls: ['./linea-venta.component.scss'],
})
export class LineaVentaComponent implements OnInit {
    
  public linea: LineaVenta;
  private cliente: string;
  private contacto: string;
  public errorMessage: string;
  public descuentoCadena: string;
  cantidadAnterior: number; // lo usamos para ejecutar cambiarProducto solo si cambia la cantidad

constructor(
  private servicio: LineaVentaService, 
  private alertCtrl: AlertController, 
  private nav: NavController,
  private route: ActivatedRoute,
  private firebaseAnalytics: FirebaseAnalytics
  ) {
      this.linea = this.route.snapshot.queryParams.linea;
      this.cliente = this.route.snapshot.queryParams.cliente;
      this.contacto = this.route.snapshot.queryParams.contacto;
      this.actualizarDescuento(this.linea.DescuentoLinea * 100);
      this.cantidadAnterior = this.linea.Cantidad;
  }

  @ViewChild('inputProducto') txtProducto: any;

  ngOnInit(): void {
    setTimeout(() => {
      this.txtProducto.setFocus();      
    }, 200);
  }

  submitted = false;
  onSubmit() { this.submitted = true; }

  public actualizarDescuento(dto: any): void {
      if(isNaN(dto)) {
          dto = (String(dto)).replace(/[^\d.-]/g, '');
      }
      
      this.linea.DescuentoLinea = dto / 100;
      this.descuentoCadena = dto + '%';
  }

  public cambiarCantidad(nuevoProducto: string) {
    if (this.cantidadAnterior == this.linea.Cantidad) {
      return;
    }
    this.linea.Producto = ''; // para que ejecute el código de cambiarProducto
    this.cambiarProducto(nuevoProducto);
    this.cantidadAnterior = this.linea.Cantidad;
  }

  public cambiarProducto(nuevoProducto: string): void {    
    if (nuevoProducto == this.linea.Producto)  {
      return;
    }
      this.servicio.getProducto(nuevoProducto, this.cliente, this.contacto, this.linea.Cantidad).subscribe(
          async data => {
              if (data.length === 0) {
                  let alert: any = await this.alertCtrl.create({
                      header: 'Error',
                      message: 'No existe el producto ' + nuevoProducto,
                      buttons: ['Ok'],
                  });
                  await alert.present();
              } else {
                  this.firebaseAnalytics.logEvent("cambiar_producto", {productoAnterior: this.linea.Producto, productoNuevo: nuevoProducto});
                  this.linea.Producto = nuevoProducto;
                  this.linea.PrecioUnitario = data.precio;
                  this.linea.texto = data.nombre;
                  this.linea.AplicarDescuento = data.aplicarDescuento;
                  this.linea.DescuentoProducto = data.descuento;
                  this.linea.DescuentoLinea = 0;
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
    this.firebaseAnalytics.logEvent("abrir_producto", {producto: this.linea.Producto});
    this.nav.navigateForward('producto', { queryParams: { empresa: "1", producto: this.linea.Producto }});
  }

  public seleccionarTexto(evento: any): void {
    var nativeInputEle = evento.target;
    nativeInputEle.getInputElement().then(
      a => a.select()
    )
  }
}
