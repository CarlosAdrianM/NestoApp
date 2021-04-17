import { Component, Input, ViewChild } from '@angular/core';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { SelectorBase } from '../selectorbase/selectorbase.component';
import { SelectorPlantillaVentaService } from './selector-plantilla-venta.service';

@Component({
  selector: 'selector-plantilla-venta',
  templateUrl: './selector-plantilla-venta.component.html',
  styleUrls: ['./selector-plantilla-venta.component.scss'],
})
export class SelectorPlantillaVentaComponent extends SelectorBase {
  
  @Input() public cliente: any;
  @Input() public estadoCliente: number;
  @Input() public almacen: any;

  constructor(
      private servicio: SelectorPlantillaVentaService, 
      private alertCtrl: AlertController, 
      private loadingCtrl: LoadingController, 
      private nav: NavController, 
      private keyboard: Keyboard
      ) { super(); }

  @ViewChild('filtro') myProductoSearchBar;

  public setFocus(): void {
      setTimeout(() => {
          this.myProductoSearchBar.setFocus();
          this.keyboard.show();
      }, 500);
  }

  public async cargarDatos(cliente: any): Promise<void> {
      let loading: any = await this.loadingCtrl.create({
          message: 'Cargando Productos...',
      });

      await loading.present();

      this.servicio.getProductos(cliente).subscribe(
          async data => {
              data = data.map(function (item): any {
                  let clone: any = Object.assign({}, item); // Objects are pass by referenced, hence, you need to clone object
                  clone.aplicarDescuentoFicha = clone.aplicarDescuento;
                  clone.esSobrePedido = clone.estado != 0;
                  return clone;
              });        
              
              if (data.length === 0) {
                  let alert: any = await this.alertCtrl.create({
                      header: 'Error',
                      message: 'Este cliente no tiene histórico de compras',
                      buttons: ['Ok'],
                  });
                  await alert.present();
                  await alert.onDidDismiss();
                  this.setFocus();
              } else {
                this.servicio.ponerStocks(data, this.almacen, false).subscribe(
                    async data => {
                        this.inicializarDatos(data);
                    },
                    error => this.errorMessage = <any>error,
                    async () => {
                        await loading.dismiss();
                        this.setFocus();
                    }
                )
              }
          },
          async error => {
              await loading.dismiss();
              this.errorMessage = <any>error;
              //this.myProductoSearchBar.setFocus();
          },

      );
      //this.myProductoSearchBar.setFocus();
  }

  public abrirDetalle(producto: any, almacen: any): void {
      if (this.agregarDato(producto)) {
          console.log("Agregado dato");
          producto.aplicarDescuentoFicha = producto.aplicarDescuento;
      }
      this.nav.navigateForward('selector-plantilla-venta-detalle', { queryParams: { producto: producto, cliente: this.cliente, almacen: almacen }});
  }

  public cargarResumen(): any[] {
      let productosResumen: any[] = [];
      this.baseImponiblePedido = 0;
      this.baseImponibleParaPortes = 0;
      for (let value of this.datosIniciales()) {
          if (+value.cantidad !== 0 || +value.cantidadOferta !== 0) {
              productosResumen.push(value);
              console.log("Nº elementos en resumen: " + productosResumen.length);
              value.esSobrePedido = !(value.estado == 0 ||(value.stockActualizado && value.cantidadDisponible >= +value.cantidad + value.cantidadOferta));
              if(!value.stockActualizado) {
                  value.colorSobrePedido = 'default';
              } else if (value.esSobrePedido) {
                  value.colorSobrePedido = 'danger';
              } else {
                  value.colorSobrePedido = 'none';
              }
              this.baseImponiblePedido += value.cantidad * value.precio * (1 - value.descuento);
              if (!value.esSobrePedido) {
                  this.baseImponibleParaPortes += value.cantidad * value.precio * (1 - value.descuento);
              }

          }
      }
      console.log("Productos resumen: " +  productosResumen.toString());
      return productosResumen;
  }

  public ngOnChanges(changes): void {
      if (this.estadoCliente != 5)
      {
          this.cargarDatos(this.cliente);
      } else {
          this.inicializarDatos([]);
      }
  }

  public fijarFiltroBuscarEnTodos(evento: any) {
      if (this.datosFiltrados && this.datosFiltrados.length>0) {
          this.fijarFiltro(evento);
      } else {
          this.buscarEnTodosLosProductos(this.myProductoSearchBar.value);
          this.setFocus();
          this.myProductoSearchBar.getInputElement().then(
            a => a.select()
          );
      }
  }

  public buscarEnTodosLosProductos(filtro: any): void {
      this.filtrosFijados = [];
      this.filtrosFijados.push(filtro);
      this.servicio.buscarProductos(filtro).subscribe(
          async data => {
              if (data.length === 0) {
                  let alert: any = await this.alertCtrl.create({
                      header: 'Error',
                      message: 'No hay productos que coincidan con ' + filtro,
                      buttons: ['Ok'],
                  });
                  await alert.present();
              } else {
                this.servicio.ponerStocks(data, this.almacen, false).subscribe(
                    async data => {
                        this.inicializarDatosFiltrados(data);
                    },
                    error => this.errorMessage = <any>error
                )
              }
          },
          error => this.errorMessage = <any>error
      );
  }

  public hayAlgunProducto() {
      let datos = this.datosIniciales();
      if (!datos) {
          return false;
      }
      const tieneCantidad = (item) => (+item.cantidad !== 0 || +item.cantidadOferta !== 0);
      return datos.some(tieneCantidad);
  }

  public ponerStocks(ordenar: boolean): void {
      this.servicio.ponerStocks(this.datosFiltrados, this.almacen, ordenar).subscribe(
          async data => {
              this.datosFiltrados = data;
          },
          error => this.errorMessage = <any>error
      )
  }

  public soloConStock() {
    this.datosFiltrados = this.datosFiltrados.filter(d => d.cantidadDisponible > 0);
  }

  get totalPedido(): number {
      // Hay que calcularlo bien
      return this._baseImponiblePedido * 1.21;
  }

  private _baseImponiblePedido: number = 0;
  get baseImponiblePedido(): number {
      return this._baseImponiblePedido;
  }
  set baseImponiblePedido(value: number) {
      this._baseImponiblePedido = value;
  }

  private _baseImponibleParaPortes: number = 0;
  get baseImponibleParaPortes(): number {
      return this._baseImponibleParaPortes;
  }
  set baseImponibleParaPortes(value: number) {
      this._baseImponibleParaPortes = value;
  }
}
