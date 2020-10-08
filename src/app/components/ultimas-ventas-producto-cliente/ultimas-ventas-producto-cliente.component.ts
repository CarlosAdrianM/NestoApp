import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UltimasVentasProductoClienteService } from './ultimas-ventas-producto-cliente.service';

@Component({
  selector: 'app-ultimas-ventas-producto-cliente',
  templateUrl: './ultimas-ventas-producto-cliente.component.html',
  styleUrls: ['./ultimas-ventas-producto-cliente.component.scss'],
})
export class UltimasVentasProductoClienteComponent {

  constructor(
    private servicio: UltimasVentasProductoClienteService,     
    private route: ActivatedRoute
    ) {
      this.cargarUltimasVentas(this.route.snapshot.queryParams.producto, this.route.snapshot.queryParams.cliente);
  }

  public movimientos: any[];
  private errorMessage: string;
  
  private cargarUltimasVentas(cliente: string, producto: string): void {
      this.servicio.cargarUltimasVentas(cliente, producto).subscribe(
          data => {
              this.movimientos = data;
              for (let mov of this.movimientos) {
                  mov.fechaMostrar = new Date(mov.fecha);
              }
          },
          error => this.errorMessage = <any>error
      );
  }
}
