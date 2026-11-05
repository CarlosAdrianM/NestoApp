import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { MiResumenSugerencias, RespuestaSugerencia, SugerenciaProducto, etiquetaMotivo, nombreSugerencia, productoYFamilia } from 'src/app/models/sugerencias-productos.model';
import { SugerenciasProductosService } from 'src/app/services/sugerencias-productos.service';
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

  /** NestoApp#265: lo que gana el vendedor marcando ✓/✗ (solo lo suyo). null = no se enseña nada. */
  public resumen: MiResumenSugerencias | null = null;

  constructor(private modalCtrl: ModalController, private alertCtrl: AlertController, private servicio: SugerenciasProductosService) { }

  ngOnInit(): void {
    if (!AyudaSugerenciasProductosComponent.yaVista()) {
      AyudaSugerenciasProductosComponent.marcarVista();
      this.verAyuda();
    }
    this.cargarResumen();
  }

  /** Al abrir y después de cada ✓/✗/🚫, para que vea que cuenta. Nada de sondeo. */
  public cargarResumen(): void {
    this.servicio.miResumen().subscribe(resumen => { this.resumen = resumen; });
  }

  public async verDetalleResumen(): Promise<void> {
    if (!this.resumen?.Ayuda) {
      return;
    }
    const alert = await this.alertCtrl.create({ header: 'Sus respuestas', message: this.resumen.Ayuda, cssClass: 'alerta-preformateada', buttons: ['Cerrar'] });
    await alert.present();
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
        this.cargarResumen(); // NestoApp#265
      }
    } finally {
      this.ocupado = false;
    }
  }

  public async rechazar(sugerencia: SugerenciaProducto, respuesta: RespuestaSugerencia): Promise<void> {
    await this.estado.responder(sugerencia, respuesta);
    this.cargarResumen(); // NestoApp#265
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
