import { Component, OnInit } from '@angular/core';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics/ngx';
import { NavController, NavParams, AlertController, LoadingController } from '@ionic/angular';
import { Usuario } from 'src/app/models/Usuario';
import { ComisionesService } from './comisiones.service';
import { ResumenComisionesMes, IEtiquetaComisionAcumulada, IEtiquetaComision } from './comisiones.interfaces';
import { ComisionesHelper } from './comisiones.helper';
import { esEtiquetaAcumulada } from './comisiones.interfaces';

@Component({
  selector: 'app-comisiones',
  templateUrl: './comisiones.component.html',
  styleUrls: ['./comisiones.component.scss'],
})
export class ComisionesComponent implements OnInit {
  public resumen: ResumenComisionesMes;
  public etiquetaGeneral: IEtiquetaComisionAcumulada;
  private hoy: Date = new Date();
  private mesActual: number = this.hoy.getMonth();
  private mesSeleccionado: number = this.hoy.getMonth();
  private annoActual: number = this.hoy.getFullYear();
  private annoSeleccionado: number = this.hoy.getFullYear();
  public nombreMesSeleccionado: string = this.hoy.toLocaleDateString('es-ES', { month: 'long' });
  testCheckboxOpen: boolean;
  testCheckboxResult;
  public incluirAlbaranes: boolean = true;
  public incluirPicking: boolean = false;
  public deshabilitarIncluirAlbaranes: boolean = false;
  public vendedorSeleccionado: string;
  
  constructor(
    private servicio: ComisionesService, 
    private nav: NavController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController, 
    public usuario: Usuario,
    private firebaseAnalytics: FirebaseAnalytics
    ) {
    this.vendedorSeleccionado = usuario.vendedor;
  }
  
  ngOnInit() {
    this.cargarResumen();
  }

  seleccionarVendedor(vendedor: string) {
    this.vendedorSeleccionado = vendedor;
    this.cargarResumen();
  }

  async cargarResumen() {
    if (!this.vendedorSeleccionado) {
      return;
    }
    
    let loading: any = await this.loadingCtrl.create({
      message: 'Cargando Comisiones...',
    });
    await loading.present();
    
    this.servicio.cargarResumen(this.vendedorSeleccionado, this.mesSeleccionado + 1, this.annoSeleccionado, this.incluirAlbaranes, this.incluirPicking)
      .subscribe(
      async data => {
        if (!data || !data.Etiquetas || data.Etiquetas.length === 0) {
          let alert = await this.alertCtrl.create({
            message: 'Error',
            subHeader: 'No se han cargado correctamente las comisiones',
            buttons: ['Ok'],
          });
          await alert.present();
        } else {
          this.firebaseAnalytics.logEvent("consultar_comisiones", {vendedor: this.vendedorSeleccionado, "screen_name": "Comisiones"});
          this.resumen = data;
          this.etiquetaGeneral = ComisionesHelper.obtenerEtiquetaGeneral(data);
        }
      },
      async error => {
        await loading.dismiss();
      },
      async () => {
        await loading.dismiss();
      }
    );
  }
  
  abrirDetalle(etiqueta: string) {
    this.nav.navigateForward('comisiones-detalle', { queryParams: {
      vendedor: this.vendedorSeleccionado, anno: this.annoSeleccionado, mes: this.mesSeleccionado+1, 
      incluirAlbaranes: this.incluirAlbaranes, etiqueta: etiqueta 
    }});
  }

  // Método para verificar si una etiqueta es acumulada
  esEtiquetaAcumulada(etiqueta: IEtiquetaComision): boolean {
    return esEtiquetaAcumulada(etiqueta);
  }
  
  async doCheckbox() {
    let fechaNombreMes: Date = new Date(this.annoActual -1, this.mesActual);
    let etiquetaAnnoAnterior = fechaNombreMes.toLocaleDateString('es-ES', { month: 'long' }) + " " + (this.annoActual- 1);
    etiquetaAnnoAnterior = etiquetaAnnoAnterior.charAt(0).toUpperCase() + etiquetaAnnoAnterior.slice(1);
    
    let buttonsMeses = [{
      text : 'Cancelar'
    },
    {
      text: 'OK',
      handler: data => {
        this.mesSeleccionado = +data;
        if (this.mesSeleccionado == 12) {
          this.mesSeleccionado = this.mesActual;
          this.annoSeleccionado = this.annoActual -1;
        } else if (this.mesSeleccionado <= this.mesActual) {
          this.annoSeleccionado = this.annoActual
        } else {
          this.annoSeleccionado = this.annoActual - 1;
        }
        this.deshabilitarIncluirAlbaranes = this.mesActual != this.mesSeleccionado;
        let fechaNombreMes: Date = new Date(this.annoSeleccionado, this.mesSeleccionado);
        this.nombreMesSeleccionado = fechaNombreMes.toLocaleDateString('es-ES', { month: 'long' }) + " " + this.annoSeleccionado;
        this.incluirPicking = this.incluirPicking && !this.deshabilitarIncluirAlbaranes;
        if (this.incluirAlbaranes == this.deshabilitarIncluirAlbaranes) {
          this.incluirAlbaranes = !this.deshabilitarIncluirAlbaranes;
        } else {
          this.cargarResumen();
        }
      }      
    }];

    let alert = await this.alertCtrl.create({
      header : 'Seleccione el mes deseado',
      inputs: [{
        name: 'enero',
        type: 'radio',
        label: 'Enero',
        value: '0',
        checked: this.mesSeleccionado == 0
      },
      {
        name: 'febrero',
        type: 'radio',
        label: 'Febrero',
        value: '1',
        checked: this.mesSeleccionado == 1
      },
      {
        name: 'marzo',
        type: 'radio',
        label: 'Marzo',
        value: '2',
        checked: this.mesSeleccionado == 2
      },
      {
        name: 'abril',
        type: 'radio',
        label: 'Abril',
        value: '3',
        checked: this.mesSeleccionado == 3
      },
      {
        name: 'mayo',
        type: 'radio',
        label: 'Mayo',
        value: '4',
        checked: this.mesSeleccionado == 4
      },
      {
        name: 'junio',
        type: 'radio',
        label: 'Junio',
        value: '5',
        checked: this.mesSeleccionado == 5
      },
      {
        name: 'julio',
        type: 'radio',
        label: 'Julio',
        value: '6',
        checked: this.mesSeleccionado == 6
      },
      {
        name: 'agosto',
        type: 'radio',
        label: 'Agosto',
        value: '7',
        checked: this.mesSeleccionado == 7
      },
      {
        name: 'septiembre',
        type: 'radio',
        label: 'Septiembre',
        value: '8',
        checked: this.mesSeleccionado == 8
      },
      {
        name: 'octubre',
        type: 'radio',
        label: 'Octubre',
        value: '9',
        checked: this.mesSeleccionado == 9
      },
      {
        name: 'noviembre',
        type: 'radio',
        label: 'Noviembre',
        value: '10',
        checked: this.mesSeleccionado == 10
      },
      {
        name: 'diciembre',
        type: 'radio',
        label: 'Diciembre',
        value: '11',
        checked: this.mesSeleccionado == 11
      },
      {
        name: 'anterior',
        type: 'radio',
        label: etiquetaAnnoAnterior,
        value: '12',
        checked: this.mesSeleccionado == 12
      }],
      buttons: buttonsMeses
    });
    
    await alert.present().then(() => {
      this.testCheckboxOpen = true;
    });
  }

  colorRango(rojo: boolean): string {
    return rojo ? 'danger' : 'success';
  }

  // Nuevo getter para usar con la etiqueta General
  get colorRangoGeneral(): string {
    return this.etiquetaGeneral?.BajaSaltoMesSiguiente ? 'danger' : 'success';
  }

// Método para verificar si una etiqueta tiene información para mostrar
  // CAMBIO: Ahora todas las etiquetas tienen botón de info
  tieneInformacionDetalle(etiqueta: IEtiquetaComision): boolean {
    // Todas las etiquetas tienen al menos información anual
    return true;
  }

  async mostrarDetalleEtiqueta(etiqueta: IEtiquetaComision) {
    const mensajeInfo = this.construirMensajeDetalle(etiqueta);
    
    const alert = await this.alertCtrl.create({
      header: `Detalle: ${etiqueta.Nombre}`,
      message: mensajeInfo,
      buttons: ['Cerrar'],
      cssClass: 'comisiones-detalle-alert'
    });
    
    await alert.present();
  }

  private construirMensajeDetalle(etiqueta: IEtiquetaComision): string {
    const lineas: string[] = [];
    const esAcumulada = esEtiquetaAcumulada(etiqueta);
    const esRecuento = (etiqueta as any).Recuento !== undefined;
    
    // Abrimos el wrapper con CSS inline
    lineas.push(`<div style="font-size: 14px;">`);
    
    // Datos acumulados del año (TODAS las etiquetas tienen esto)
    lineas.push(`<div style="margin-bottom: 12px;"><strong>📊 Datos del Año:</strong></div>`);
    
    lineas.push(`<table style="width:100%; border-collapse: collapse; margin-bottom: 8px;">`);
    
    if (etiqueta.CifraAnual !== undefined) {
      const unidad = etiqueta.UnidadCifra || '€';
      let valorFormateado: string;
      let etiquetaCifra: string;
      
      if (esRecuento) {
        etiquetaCifra = 'Total conseguidos año';
        valorFormateado = ComisionesHelper.formatNumber(etiqueta.CifraAnual, 0);
      } else if (unidad === '€') {
        etiquetaCifra = 'Cifra anual';
        valorFormateado = ComisionesHelper.formatCurrency(etiqueta.CifraAnual);
      } else {
        etiquetaCifra = 'Cifra anual';
        valorFormateado = `${ComisionesHelper.formatNumber(etiqueta.CifraAnual, 0)} ${unidad}`;
      }
      
      lineas.push(`  <tr>`);
      lineas.push(`    <td style="padding: 4px 8px 4px 0; vertical-align: top;">${etiquetaCifra}:</td>`);
      lineas.push(`    <td style="padding: 4px 0; font-weight: bold; text-align: right; white-space: nowrap;">${valorFormateado}</td>`);
      lineas.push(`  </tr>`);
    }
    
    if (etiqueta.ComisionAnual !== undefined) {
      const etiquetaComision = esRecuento ? 'Total comisión año' : 'Comisión anual';
      lineas.push(`  <tr>`);
      lineas.push(`    <td style="padding: 4px 8px 4px 0; vertical-align: top;">${etiquetaComision}:</td>`);
      lineas.push(`    <td style="padding: 4px 0; font-weight: bold; text-align: right; white-space: nowrap;">${ComisionesHelper.formatCurrency(etiqueta.ComisionAnual)}</td>`);
      lineas.push(`  </tr>`);
    }
    
    if (!esRecuento && etiqueta.PorcentajeAnual !== undefined) {
      lineas.push(`  <tr>`);
      lineas.push(`    <td style="padding: 4px 8px 4px 0; vertical-align: top;">% Comisión año:</td>`);
      lineas.push(`    <td style="padding: 4px 0; font-weight: bold; text-align: right; white-space: nowrap;">${ComisionesHelper.formatPercent(etiqueta.PorcentajeAnual)}</td>`);
      lineas.push(`  </tr>`);
    }
    
    lineas.push(`</table>`);
    
    if (esAcumulada) {
      const etiquetaAcumulada = etiqueta as IEtiquetaComisionAcumulada;
      
      // Separador visual
      lineas.push(`<div style="height: 20px;"></div>`);
      
      lineas.push(`<div style="margin-bottom: 12px;"><strong>🎯 Información de Tramos:</strong></div>`);
      lineas.push(`<table style="width:100%; border-collapse: collapse; margin-bottom: 8px;">`);
      
      lineas.push(`  <tr>`);
      lineas.push(`    <td style="padding: 4px 8px 4px 0; vertical-align: top;">Tramo actual:</td>`);
      lineas.push(`    <td style="padding: 4px 0; font-weight: bold; text-align: right; white-space: nowrap;">${ComisionesHelper.formatCurrency(etiquetaAcumulada.InicioTramo)} - ${ComisionesHelper.formatCurrency(etiquetaAcumulada.FinalTramo)}</td>`);
      lineas.push(`  </tr>`);
      
      lineas.push(`  <tr>`);
      lineas.push(`    <td style="padding: 4px 8px 4px 0; vertical-align: top;">Proyección año:</td>`);
      lineas.push(`    <td style="padding: 4px 0; font-weight: bold; text-align: right; white-space: nowrap;">${ComisionesHelper.formatCurrency(etiquetaAcumulada.Proyeccion)}</td>`);
      lineas.push(`  </tr>`);
      
      lineas.push(`  <tr>`);
      lineas.push(`    <td style="padding: 4px 8px 4px 0; vertical-align: top;">Falta para salto:</td>`);
      lineas.push(`    <td style="padding: 4px 0; font-weight: bold; text-align: right; white-space: nowrap;">${ComisionesHelper.formatCurrency(etiquetaAcumulada.FaltaParaSalto)}</td>`);
      lineas.push(`  </tr>`);
      
      lineas.push(`  <tr>`);
      lineas.push(`    <td style="padding: 4px 8px 4px 0; vertical-align: top;">% Real:</td>`);
      lineas.push(`    <td style="padding: 4px 0; font-weight: bold; text-align: right; white-space: nowrap;">${ComisionesHelper.formatPercent(etiquetaAcumulada.TipoReal)}</td>`);
      lineas.push(`  </tr>`);
      
      lineas.push(`  <tr>`);
      lineas.push(`    <td style="padding: 4px 8px 4px 0; vertical-align: top;">% Conseguido:</td>`);
      lineas.push(`    <td style="padding: 4px 0; font-weight: bold; text-align: right; white-space: nowrap;">${ComisionesHelper.formatPercent(etiquetaAcumulada.TipoConseguido)}</td>`);
      lineas.push(`  </tr>`);
      
      lineas.push(`</table>`);
      
      const estadoTramo = etiquetaAcumulada.BajaSaltoMesSiguiente 
        ? '🔴 Baja de tramo mes siguiente' 
        : '🟢 Al acabar el mes mantiene el tramo';
      lineas.push(`<div style="margin: 12px 0;">${estadoTramo}</div>`);
      
      if (etiquetaAcumulada.ComisionRecuperadaEsteMes && etiquetaAcumulada.ComisionRecuperadaEsteMes !== 0) {
        // Separador visual
        lineas.push(`<div style="height: 20px;"></div>`);
        
        const ajuste = etiquetaAcumulada.ComisionRecuperadaEsteMes > 0 
          ? `⬇️ Bajada: ${ComisionesHelper.formatCurrency(etiquetaAcumulada.ComisionRecuperadaEsteMes)}`
          : `⬆️ Incremento: ${ComisionesHelper.formatCurrency(-etiquetaAcumulada.ComisionRecuperadaEsteMes)}`;
        lineas.push(`<div style="margin-bottom: 8px;"><strong>💰 Ajuste de Comisión:</strong></div>`);
        lineas.push(`<div style="margin: 8px 0;">${ajuste}</div>`);
      }
      
      if (etiquetaAcumulada.TieneEstrategiaEspecial) {
        // Separador visual
        lineas.push(`<div style="height: 20px;"></div>`);
        
        lineas.push(`<div style="margin-bottom: 8px;"><strong>⚠️ Estrategia Especial:</strong></div>`);
        lineas.push(`<div style="margin: 8px 0;">${etiquetaAcumulada.TextoSobrepago || 'Sin detalles'}</div>`);
        if (etiquetaAcumulada.MotivoEstrategia) {
          lineas.push(`<div style="margin: 4px 0;">Motivo: ${etiquetaAcumulada.MotivoEstrategia}</div>`);
        }
      } else if (etiquetaAcumulada.TextoSobrepago && etiquetaAcumulada.TextoSobrepago !== etiquetaAcumulada.Nombre) {
        // Separador visual
        lineas.push(`<div style="height: 20px;"></div>`);
        
        lineas.push(`<div style="margin-bottom: 8px;"><strong>ℹ️ Info adicional:</strong></div>`);
        lineas.push(`<div style="margin: 8px 0;">${etiquetaAcumulada.TextoSobrepago}</div>`);
      }
    }
    
    lineas.push(`</div>`); // Cierre del wrapper
    
    return lineas.join('');
  }
}