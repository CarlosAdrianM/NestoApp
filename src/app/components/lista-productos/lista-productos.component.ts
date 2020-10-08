import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-lista-productos',
  templateUrl: './lista-productos.component.html',
  styleUrls: ['./lista-productos.component.scss'],
})
export class ListaProductosComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    setTimeout(()=>{
      this.selectorClientes.setFocus();
    },500)
  }

  @ViewChild('selector') selectorClientes: any;


}
