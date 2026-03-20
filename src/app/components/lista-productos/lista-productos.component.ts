import { Component, OnInit, ViewChild } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Component({
    selector: 'app-lista-productos',
    templateUrl: './lista-productos.component.html',
    styleUrls: ['./lista-productos.component.scss'],
    standalone: false
})
export class ListaProductosComponent implements OnInit {

  constructor(private loadingCtrl: LoadingController) { }

  ngOnInit() {
    // Dismiss any orphaned loading overlays from previous pages
    this.loadingCtrl.getTop().then(loading => {
      if (loading) {
        loading.dismiss().catch(() => {});
      }
    });

    setTimeout(()=>{
      this.selectorClientes.setFocus();
    },500)
  }

  @ViewChild('selector') selectorClientes: any;

}
