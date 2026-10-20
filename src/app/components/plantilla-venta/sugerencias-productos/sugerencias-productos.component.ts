import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { RespuestaSugerencia, SugerenciaProducto, etiquetaMotivo, nombreSugerencia, productoYFamilia } from 'src/app/models/sugerencias-productos.model';
import { EstadoSugerenciasProductos } from './estado-sugerencias-productos';
import { AyudaSugerenciasProductosComponent } from './ayuda-sugerencias-productos.component';

/**
 * NestoApp#235 (Nesto#537): la hoja inferior con las tarjetas de «Puede ofrecer». Lee las
 * sugerencias del estado de la plantilla, así que al contestar se ven los cambios al momento.
 */
@Component({
  selector: 'sugerencias-productos',
  templateUrl: './sugerencias-productos.component.html',
  styleUrls: ['./sugerencias-productos.component.scss'],
  standalone: false
})
export class SugerenciasProductosComponent implements OnInit {
  @Input() public estado: EstadoSugerenciasProductos;
  /** Mete el producto en la plantilla con 1 unidad. false si no se ha podido. */
  @Input() public anadir: (sugerencia: SugerenciaProducto) => Promise<boolean>;

  public ocupado = false;
  public readonly etiquetaMotivo = etiquetaMotivo;
  public readonly nombre = nombreSugerencia;
  public readonly productoYFamilia = productoYFamilia;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit(): void {
    if (!AyudaSugerenciasProductosComponent.yaVista()) {
      AyudaSugerenciasProductosComponent.marcarVista();
      this.verAyuda();
    }
  }

  get sugerencias(): SugerenciaProducto[] {
    return this.estado?.sugerencias || [];
  }

  public async aceptar(sugerencia: SugerenciaProducto): Promise<void> {
    if (this.ocupado) {
      return;
    }
    this.ocupado = true;
    try {
      if (await this.anadir(sugerencia)) {
        await this.estado.responder(sugerencia, 'Anadido');
      }
    } finally {
      this.ocupado = false;
    }
  }

  public rechazar(sugerencia: SugerenciaProducto, respuesta: RespuestaSugerencia): void {
    this.estado.responder(sugerencia, respuesta);
  }

  public async verAyuda(): Promise<void> {
    const modal = await this.modalCtrl.create({ component: AyudaSugerenciasProductosComponent });
    await modal.present();
  }

  public cerrar(): void {
    this.modalCtrl.dismiss();
  }

  public identificador(_: number, sugerencia: SugerenciaProducto): number {
    return sugerencia.IdSugerencia;
  }
}
