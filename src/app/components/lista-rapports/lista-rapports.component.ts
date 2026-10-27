import { Component, ViewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DireccionesService } from '../../services/direcciones.service';
import { nombreResultadoRapport } from 'src/app/models/resultado-rapport.model';
import { NavController, AlertController, LoadingController, ToastController, ModalController } from '@ionic/angular';
import { Usuario } from 'src/app/models/Usuario';
import { Events } from 'src/app/services/events.service';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';
import { SelectorBase } from '../selectorbase/selectorbase.component';
import { ListaRapportsService } from './lista-rapports.service';
import { ModalResumenVentasComponent } from '../resumen-ventas/modal-resumen-ventas.component';
import { Geolocation } from '../../services/geolocation.service';
import { FirebaseAnalytics } from 'src/app/services/firebase-analytics.service';
import { RitmoContactos, SugerenciaContacto, VendedorVisible, colorPrioridad, esProhibido, marcarAtendida, ordenarSugerenciasContacto, telefonoParaLlamar, vendedorVisibleParaContactar } from 'src/app/models/sugerencias-contacto.model';
import { ChequeRegaloPendiente, ResumenChequesRegalo, ResumenChequesVendedor, enlaceWhatsApp, textoDiasRestantesCheque, textoFacturaCheque, textoUltimoContactoCheque } from 'src/app/models/cheques-regalo-vendedor.model';
import { VisorFicheros } from 'src/app/services/visor-ficheros.service';


@Component({
    selector: 'app-lista-rapports',
    templateUrl: './lista-rapports.component.html',
    styleUrls: ['./lista-rapports.component.scss'],
    standalone: false
})
export class ListaRapportsComponent extends SelectorBase {
  @ViewChild('clienteInput') myClienteInput;
  @ViewChild('buscarInput') myFiltroInput;
  @ViewChild('barraFiltrar') myBarraFiltrar;

  private nav: NavController;
  private servicio: ListaRapportsService;
  private alertCtrl: AlertController;
  private loadingCtrl: LoadingController;
  public segmentoRapports: string = 'cliente';
  
  private hoy: Date = new Date();
  private fechaYaAjustada: boolean;
  private _fechaRapports: string
  get fechaRapports(): string {
      return this._fechaRapports;
  }
  set fechaRapports(value: string) {
      this._fechaRapports = value;
      const date = new Date(value);
      const userTimezoneOffset = date.getTimezoneOffset() * 60000;
      const dateAjustada = new Date(date.getTime() - userTimezoneOffset);
      if (this.fechaYaAjustada) {
          this._fechaRapports = date.toISOString();
      } else {
        this._fechaRapports = dateAjustada.toISOString();
        this.fechaYaAjustada = true;
      }
  }
  public clienteRapport: string;
  public contactoRapport: string;
  public numeroCliente: string = "";
  public contactoSeleccionado: string = "";
  public mostrarDirecciones: boolean;

  public codigosPostalesSinVisitar: any[] = [];
  /** NestoApp#253: el nombre del resultado del rapport para el chip. */
  public readonly nombreResultado = nombreResultadoRapport;
  public vendedorSeleccionado: string;
  public listadoClientesSinVisitar: any[] = [];
  public listadoClientesSinVisitarFiltrado: any[] = [];
  private _codigoPostalSeleccionado: any;
  public filtro: string = "";
  public filtroBuscar: string = "";

  public mostrarPopoverFiltros = false;
  public filtroCodigosPostales: 'filtrado' | 'todos' = 'filtrado';
  public filtroClientesSinVisitar: 'visitables' | 'todos' = 'visitables';

  /** NestoApp#212 / NestoAPI#603: clientes para contactar hoy, por prioridad y cadencia. */
  public sugerenciasContacto: SugerenciaContacto[] = [];
  public ritmoContacto: RitmoContactos | null = null;
  public cargandoSugerenciasContacto = false;
  /** Lo que se dice en lugar de la lista cuando no hay (sin endpoint, error o lista vacía). */
  public mensajeSugerenciasContacto = '';

  public segmentoAnterior: string | null = null;
  public clienteAnterior: string | null = null;
  public contactoAnterior: string | null = null;

  
  get codigoPostalSeleccionado() {
      return this._codigoPostalSeleccionado;
  }
  set codigoPostalSeleccionado(value: any) {
      this._codigoPostalSeleccionado = value;
      this.cargarClientesSinVisitar();
      setTimeout(() => {
          this.myBarraFiltrar.setFocus();
      }, 150);
      
  }

  // Variables de geolocalización
  geoLatitude: number;
  geoLongitude: number;
  geoAccuracy:number;
  //geoAddress: string;

  generandoResumen = false;

  constructor(servicio: ListaRapportsService, nav: NavController, alertCtrl: AlertController,
          loadingCtrl: LoadingController, public usuario: Usuario,
          private geolocation: Geolocation, private direcciones: DireccionesService,
          public events: Events,
          private firebaseAnalytics: FirebaseAnalytics, private toastController: ToastController,
          private modalCtrl: ModalController, private visorFicheros: VisorFicheros) {
      super();
      this.servicio = servicio;
      this.nav = nav;
      this.alertCtrl = alertCtrl;
      this.loadingCtrl = loadingCtrl;
      this.clienteRapport = "";
      this.contactoRapport;
      this.vendedorSeleccionado = usuario.vendedor;
      this.fechaRapports = this.hoy.toISOString();//.slice(0, 10);

      events.subscribe('rapportCreado', (rapportCreado: any) => {
          if (!this.datosFiltrados) {
              this.datosFiltrados = [];
          }
          this.datosFiltrados.push(rapportCreado);
          if (this.listadoClientesSinVisitarFiltrado)
          {
              const clienteEncontrado = this.listadoClientesSinVisitarFiltrado
                  .find(p => p.cliente == rapportCreado.Cliente.trim() &&
                      p.contacto == rapportCreado.Contacto.trim());
              if (clienteEncontrado != undefined) {
                  this.listadoClientesSinVisitarFiltrado = this.listadoClientesSinVisitarFiltrado.filter(obj => obj !== clienteEncontrado);
              }
          }
          if (rapportCreado?.Cliente && this.sugerenciasContacto.length > 0) {
              this.sugerenciasContacto = marcarAtendida(this.sugerenciasContacto, rapportCreado.Cliente, rapportCreado.Contacto);
          }
          if (this.listadoClientesSinVisitar)
          {
              const clienteEncontrado = this.listadoClientesSinVisitar
                  .find(p => p.cliente == rapportCreado.Cliente.trim() &&
                      p.contacto == rapportCreado.Contacto.trim());
              if (clienteEncontrado != undefined) {
                  this.listadoClientesSinVisitar = this.listadoClientesSinVisitar.filter(obj => obj !== clienteEncontrado);
              }
          }
      });
  }

  public actualizarCliente(): void {
      if (this.numeroCliente == null || this.numeroCliente.trim() == "") {
          return;
      }
      this.clienteRapport = this.numeroCliente;
  }

  seleccionarCliente(cliente: string) {
    this.numeroCliente = cliente;
    this.actualizarCliente();
    this.segmentoRapports = "cliente";
  }

  public seleccionarContacto(evento: any): void {
      if (!this.clienteRapport) {
          return;
      }
      this.contactoSeleccionado = evento.contacto;
      this.cargarDatosCliente(this.clienteRapport, evento.contacto);
  }

  public cargarDatos(): void {
      //para que implemente el interface
  }

  public async cargarDatosFecha(fecha: string): Promise<void> {
      const loading: any = await this.loadingCtrl.create({
          message: 'Cargando Rapports...',
      });

      await loading.present();

      this.servicio.cargarListaFecha(fecha).subscribe(
          async data => {
              if (data.length === 0) {
                  const alert = await this.alertCtrl.create({
                      header: 'Error',
                      message: 'No hay ningún rapport para listar en esa fecha',
                      buttons: ['Ok'],
                  });
                  await alert.present();
              } else {
                  this.inicializarDatos(data);
              }
          },
          async error => {
              await loading.dismiss();
              this.errorMessage = <any>error;
          },
          async () => {
              await loading.dismiss();
          }
      );
  }

  public async cargarDatosCliente(cliente: string, contacto: string): Promise<void> {
      const loading: any = await this.loadingCtrl.create({
          message: 'Cargando Rapports...',
      });

      await loading.present();

      this.servicio.cargarListaCliente(cliente, contacto).subscribe(
          async data => {
              if (data.length === 0) {
                  const alert = await this.alertCtrl.create({
                      header: 'Error',
                      message: 'No hay ningún rapport de ese cliente para listar',
                      buttons: ['Ok'],
                  });
                  await alert.present();
              } else {
                  this.inicializarDatos(data);
              }
          },
          async error => {
              await loading.dismiss();
              this.errorMessage = <any>error;
          },
          async () => {
              await loading.dismiss();
          }
      );
  }


  public abrirRapport(rapport: any): void {
      this.nav.navigateForward('rapport', { queryParams:{ rapport: rapport }});
  }
  
  public annadirRapport(cliente: any, tipo: string = 'V') {
      const rapport: any = new Object();
      rapport.Id = 0;
      rapport.Fecha = this.fechaRapports;
      rapport.Empresa = Configuracion.EMPRESA_POR_DEFECTO;
      if (cliente) {
          rapport.Cliente = cliente.Cliente;
          rapport.Contacto = cliente.Contacto;
      }
      //rapport.Vendedor = this.usuario.vendedor; // tiene que ser el del cliente desde la API
      rapport.Tipo = tipo; // V = visita, T = teléfono, W = WhatsApp (#226)
      rapport.Usuario = Configuracion.NOMBRE_DOMINIO + '\\' + this.usuario.nombre;
      rapport.TipoCentro = 0; // No se sabe
      rapport.Estado = 0; // Vigente
      this.firebaseAnalytics.logEvent("annadir_rapport", {cliente: rapport.Cliente, contacto: rapport.Contacto, fecha: rapport.Fecha});
      this.abrirRapport(rapport);
  }

  ionViewDidLoad() {
      setTimeout(() => {
          this.myClienteInput.setFocus();
      }, 150);
  }

  public cambiarSegmento(): void {
      if (this.segmentoRapports == 'fecha') {
          if (this.datosFiltrados == null || this.datosFiltrados.length == 0) {
              this.cargarDatosFecha(this.fechaRapports);
          }
      } else if (this.segmentoRapports == 'cliente') {
          setTimeout(() => {
              this.myClienteInput.setFocus();
          }, 150);
      } else if (this.segmentoRapports == 'codigoPostal' && this.usuario.vendedor) {
          this.cargarCodigosPostalesSinVisitar();
      } else if (this.segmentoRapports == 'contactar') {
          this.entrarEnContactar();
      } else if (this.segmentoRapports == 'buscar') {
          setTimeout(() => {
              this.myFiltroInput.setFocus();
          }, 150);
      }
  }

  seleccionarVendedor(vendedor: string) {
      this.firebaseAnalytics.logEvent("seleccionar_vendedor_rapport", {vendedor: vendedor});
      this.vendedorSeleccionado = vendedor;
      if (this.segmentoRapports === 'contactar') {
          this.cargarSugerenciasContacto();
          if (this.vistaContactar === 'cheques') {
              this.cargarChequesPendientes(); // #226
          }
          return;
      }
      this.cargarCodigosPostalesSinVisitar();
  }

  /**
   * NestoApp#212: la lista es fija durante el día (la registra la API en la primera consulta), así
   * que volver a pedirla solo trae las atendidas al día. Nunca bloquea: si no hay, se dice.
   */
  public async cargarSugerenciasContacto(): Promise<void> {
      if (!this.vendedorSeleccionado) {
          this.sugerenciasContacto = [];
          this.ritmoContacto = null;
          this.mensajeSugerenciasContacto = 'Elige un vendedor para ver a quién llamar hoy.';
          return;
      }
      this.firebaseAnalytics.logEvent('rapport_sugerencias_contacto', { vendedor: this.vendedorSeleccionado });
      this.cargandoSugerenciasContacto = true;
      this.mensajeSugerenciasContacto = '';
      try {
          const respuesta = await firstValueFrom(this.servicio.cargarSugerenciasContacto(this.vendedorSeleccionado));
          if (!respuesta) {
              this.sugerenciasContacto = [];
              this.ritmoContacto = null;
              this.mensajeSugerenciasContacto = 'La lista de clientes para contactar todavía no está disponible.';
              return;
          }
          this.sugerenciasContacto = ordenarSugerenciasContacto(respuesta.Sugerencias);
          this.ritmoContacto = respuesta.Ritmo || null;
          if (this.sugerenciasContacto.length === 0) {
              this.mensajeSugerenciasContacto = 'Hoy no hay ningún cliente sugerido para contactar.';
          }
      } catch (error) {
          this.sugerenciasContacto = [];
          this.ritmoContacto = null;
          this.mensajeSugerenciasContacto = esProhibido(error)
              ? 'No puedes ver los clientes para contactar de ese vendedor.' // #219
              : 'No se han podido cargar los clientes para contactar.';
          console.log('No se han podido cargar las sugerencias de contacto', error);
      } finally {
          this.cargandoSugerenciasContacto = false;
      }
  }

  /** #212: el botón «Llamar» de la barra. Mientras se ve, ningún segmento queda marcado. */
  public verClientesParaLlamar(): void {
      if (this.segmentoRapports === 'contactar') {
          return;
      }
      this.inicializarLosDatos(null);
      this.segmentoRapports = 'contactar';
      this.cambiarSegmento();
  }

  // ---- NestoApp#219 (Nesto#521): jefes de ventas y Dirección ven la lista de otros vendedores ----

  /** null = sin pedir o la API no lo tiene: sin selector (como antes). */
  public vendedoresVisibles: VendedorVisible[] | null = null;
  private vendedoresVisiblesPedidos = false;

  get hayVariosVendedoresVisibles(): boolean {
      return (this.vendedoresVisibles?.length || 0) > 1;
  }

  /**
   * Al entrar en «Llamar»: la lista del vendedor de siempre y, a la vez, quién más se puede ver y,
   * si hay campaña, los cheques regalo (#226). Si el vendedor no era de los visibles, se recarga.
   */
  private entrarEnContactar(): Promise<void> {
      this.cargarResumenCheques();
      this.cargarVendedoresVisibles();
      return this.cargarSugerenciasContacto();
  }

  public async cargarVendedoresVisibles(): Promise<void> {
      if (this.vendedoresVisiblesPedidos) {
          return;
      }
      this.vendedoresVisiblesPedidos = true;
      this.vendedoresVisibles = await firstValueFrom(this.servicio.cargarVendedoresVisibles()).catch(() => null);
      const visible = vendedorVisibleParaContactar(this.vendedoresVisibles, this.vendedorSeleccionado);
      if (visible !== this.vendedorSeleccionado) {
          this.seleccionarVendedor(visible);
      }
  }

  // ---- NestoApp#226 (NestoAPI#593): cheques regalo por vendedor para la barrida telefónica ----

  /** «clientes» (las sugerencias de siempre) o «cheques». La pestaña de cheques solo sale con campaña en curso. */
  public vistaContactar: 'clientes' | 'cheques' = 'clientes';
  public resumenCheques: ResumenChequesRegalo | null = null;
  public chequesPendientes: ChequeRegaloPendiente[] = [];
  public cargandoCheques = false;
  public mensajeCheques = '';
  public readonly textoDiasRestantesCheque = textoDiasRestantesCheque;
  public readonly textoFacturaCheque = textoFacturaCheque;
  public readonly textoUltimoContactoCheque = textoUltimoContactoCheque;
  public readonly enlaceWhatsApp = enlaceWhatsApp;

  public async cargarResumenCheques(): Promise<void> {
      try {
          this.resumenCheques = await firstValueFrom(this.servicio.cargarResumenChequesRegalo());
      } catch (error) {
          this.resumenCheques = null;
          console.log('No se ha podido cargar el resumen de cheques regalo', error);
      }
      if (!this.resumenCheques && this.vistaContactar === 'cheques') {
          this.vistaContactar = 'clientes';
      }
  }

  public cambiarVistaContactar(vista: string): void {
      this.vistaContactar = vista === 'cheques' ? 'cheques' : 'clientes';
      if (this.vistaContactar === 'cheques') {
          this.firebaseAnalytics.logEvent('rapport_cheques_regalo', { vendedor: this.vendedorSeleccionado });
          this.cargarChequesPendientes();
      }
  }

  public async cargarChequesPendientes(): Promise<void> {
      if (!this.vendedorSeleccionado) {
          this.chequesPendientes = [];
          this.mensajeCheques = 'Elige un vendedor para ver sus cheques pendientes.';
          return;
      }
      this.cargandoCheques = true;
      this.mensajeCheques = '';
      try {
          this.chequesPendientes = await firstValueFrom(this.servicio.cargarChequesRegaloPendientes(this.vendedorSeleccionado));
          if (this.chequesPendientes.length === 0) {
              this.mensajeCheques = 'No hay cheques pendientes de usar.';
          }
      } catch (error) {
          this.chequesPendientes = [];
          this.mensajeCheques = esProhibido(error)
              ? 'No puedes ver los cheques de ese vendedor.'
              : 'No se han podido cargar los cheques pendientes.';
          console.log('No se han podido cargar los cheques regalo pendientes', error);
      } finally {
          this.cargandoCheques = false;
      }
  }

  /** Tocar una fila del resumen cambia de vendedor (la del total no). */
  public elegirVendedorResumen(fila: ResumenChequesVendedor): void {
      if (!fila?.Vendedor) {
          return;
      }
      this.seleccionarVendedor(fila.Vendedor.trim());
  }

  public esVendedorSeleccionado(fila: ResumenChequesVendedor): boolean {
      return (fila?.Vendedor || '').trim() === (this.vendedorSeleccionado || '').trim();
  }

  public async verFacturaCheque(cheque: ChequeRegaloPendiente): Promise<void> {
      this.firebaseAnalytics.logEvent('rapport_cheque_factura', { cliente: cheque.Cliente, factura: cheque.FacturaOrigen });
      const loading = await this.loadingCtrl.create({ message: 'Descargando factura...' });
      await loading.present();
      try {
          const blob = await firstValueFrom(this.servicio.descargarFactura(cheque.EmpresaFactura, cheque.FacturaOrigen));
          await this.visorFicheros.abrir(blob, `Factura_${(cheque.FacturaOrigen || '').trim()}.pdf`, 'application/pdf');
      } catch (error) {
          const alerta = await this.alertCtrl.create({
              header: 'Factura',
              message: 'No se ha podido abrir la factura ' + (cheque.FacturaOrigen || '').trim() + '.',
              buttons: ['Ok']
          });
          await alerta.present();
      } finally {
          await loading.dismiss();
      }
  }

  /** Llamar o escribir por WhatsApp abre, igual que desde clientes para contactar, el rapport nuevo de ese cliente. */
  public abrirRapportCheque(cheque: ChequeRegaloPendiente, tipo: 'T' | 'W'): void {
      this.firebaseAnalytics.logEvent('rapport_cheque_contactar', { cliente: cheque.Cliente, tipo });
      this.annadirRapport({ Cliente: cheque.Cliente, Contacto: cheque.Contacto }, tipo);
  }

  /** Como con cualquier cliente: se abre un rapport nuevo y, al guardarlo, la API marca la sugerencia atendida. */
  public contactarSugerencia(sugerencia: SugerenciaContacto): void {
      this.firebaseAnalytics.logEvent('rapport_contactar_sugerencia', { cliente: sugerencia.Cliente, prioridad: sugerencia.Prioridad });
      this.annadirRapport({ Cliente: sugerencia.Cliente, Contacto: sugerencia.Contacto });
  }

  public colorPrioridad(prioridad: string): string {
      return colorPrioridad(prioridad);
  }

  public enlaceLlamada(telefono: string): string | null {
      const numero = telefonoParaLlamar(telefono);
      return numero ? 'tel:' + numero : null;
  }
  
  async cargarCodigosPostalesSinVisitar(forzarTodos: boolean = false) {
      if (!this.vendedorSeleccionado) {
          return;
      }
      
      const loading: any = await this.loadingCtrl.create({
          message: 'Cargando Códigos Postales...',
      });

      await loading.present();

      this.servicio.cargarCodigosPostalesSinVisitar(this.vendedorSeleccionado, forzarTodos).subscribe(
          async data => {
              if (!Array.isArray(data) || data.length === 0) {
                  const alert = await this.alertCtrl.create({
                      header: 'Error',
                      message: 'No hay ningún código postal sin visitar',
                      buttons: ['Ok'],
                  });
                  this.codigosPostalesSinVisitar = [];
                  await alert.present();
              } else {
                  this.codigosPostalesSinVisitar = data;
                  this.getGeolocation();
              }
          },
          async error => {
              await loading.dismiss();
              this.codigosPostalesSinVisitar = [];
              this.errorMessage = <any>error;
          },
          async () => {
              await loading.dismiss();
          }
      );
  }

  async cargarClientesSinVisitar() {
      if (!this.vendedorSeleccionado) {
          return;
      }
      this.firebaseAnalytics.logEvent("rapport_clientes_sin_visitar", {vendedor: this.vendedorSeleccionado});
      
      const loading: any = await this.loadingCtrl.create({
          message: 'Cargando Clientes...',
      });

      await loading.present();

      this.servicio.cargarClientesSinVisitar(this.vendedorSeleccionado, this.codigoPostalSeleccionado).subscribe(
          async data => {
              if (!Array.isArray(data) || data.length === 0) {
                  const alert = await this.alertCtrl.create({
                      header: 'Error',
                      message: 'No hay ningún cliente sin visitar',
                      buttons: ['Ok'],
                  });
                  this.listadoClientesSinVisitar = [];
                  this.listadoClientesSinVisitarFiltrado = [];
                  await alert.present();
              } else {
                  this.listadoClientesSinVisitar = data;
                  this.aplicarFiltroClientes();
              }
          },
          async error => {
              await loading.dismiss();
              this.listadoClientesSinVisitar = [];
              this.listadoClientesSinVisitarFiltrado = [];
              this.errorMessage = <any>error;
          },
          async () => {
              await loading.dismiss();
          }
      );
  }

  public async mostrarFiltros() {
    const alert = await this.alertCtrl.create({
      header: 'Seleccione los filtros deseados',
      inputs: [
        // Filtro códigos postales
        {
          type: 'checkbox',
          label: 'Cód. Postales: Solo sin visitas',
          value: 'cp_filtrado',
          checked: this.filtroCodigosPostales !== 'todos'
        },
        {
          type: 'checkbox',
          label: 'Cód. Postales: Todos',
          value: 'cp_todos',
          checked: this.filtroCodigosPostales === 'todos'
        },
  
        // Filtro clientes
        {
          type: 'checkbox',
          label: 'Clientes: Solo visitables',
          value: 'cli_visitables',
          checked: this.filtroClientesSinVisitar === 'visitables'
        },
        {
          type: 'checkbox',
          label: 'Clientes: Todos',
          value: 'cli_todos',
          checked: this.filtroClientesSinVisitar !== 'visitables'
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'OK',
          handler: (selected: string[]) => {
            // Resolver conflicto en Códigos Postales
            let filtroCP: 'todos' | 'filtrado' = 'filtrado';
            if (selected.includes('cp_todos') && !selected.includes('cp_filtrado')) {
              filtroCP = 'todos';
            }
            this.filtroCodigosPostales = filtroCP;
            this.cargarCodigosPostalesSinVisitar(filtroCP === 'todos');
          
            // Resolver conflicto en Clientes
            let filtroClientes: 'todos' | 'visitables' = 'todos';
            if (selected.includes('cli_visitables') && !selected.includes('cli_todos')) {
              filtroClientes = 'visitables';
            }
            this.filtroClientesSinVisitar = filtroClientes;
            this.aplicarFiltroClientes();
          }
          
        }
      ]
    });
  
    await alert.present();
  }
  
  

  cambiaFiltro(event: any) {
      if (!Array.isArray(this.listadoClientesSinVisitar)) {
          this.listadoClientesSinVisitarFiltrado = [];
          return;
      }
      const filtro = this.filtro.toUpperCase();
      this.listadoClientesSinVisitarFiltrado = this.listadoClientesSinVisitar.filter(
        c => c.Cliente == filtro || c.Nombre.toUpperCase().includes(filtro) || c.Direccion.toUpperCase().includes(filtro)
      )
  }

  public aplicarFiltroClientes(): void {
    if (!Array.isArray(this.listadoClientesSinVisitar)) {
      this.listadoClientesSinVisitarFiltrado = [];
      return;
    }
    if (this.filtroClientesSinVisitar === 'visitables') {
      this.listadoClientesSinVisitarFiltrado = this.listadoClientesSinVisitar.filter(
        c => c.Estado === 0 || c.Estado === 5
      );
    } else {
      this.listadoClientesSinVisitarFiltrado = [...this.listadoClientesSinVisitar];
    }
  }

  public aplicarFiltroCodigosPostales() {
    const forzarTodos = this.filtroCodigosPostales === 'todos';
    this.cargarCodigosPostalesSinVisitar(forzarTodos);
  } 
  

  public async buscarRapports(): Promise<void> {
      const loading: any = await this.loadingCtrl.create({
          message: 'Cargando Rapports...',
      });

      await loading.present();

      this.servicio.cargarRapportsFiltrados(this.filtroBuscar).subscribe(
          async data => {
              if (data.length === 0) {
                  const alert = await this.alertCtrl.create({
                      header: 'Error',
                      message: 'No hay ningún rapport que incluya ese texto',
                      buttons: ['Ok'],
                  });
                  await alert.present();
              } else {
                  this.firebaseAnalytics.logEvent("buscar_rapport", {filtro: this.filtroBuscar});
                  this.inicializarDatos(data);
              }
          },
          async error => {
              await loading.dismiss();  
              this.errorMessage = <any>error;
          },
          async () => {
              await loading.dismiss();
          }
      );
  }
  
  public colorEstado(estado: number): string {
      if (estado == 0 || estado == 9) {
          return "success";
      }
      if (estado == 5) {
          return "danger";
      }
      if (estado == 7) {
          return "primary";
      }

      return "default";
  }


  getGeolocation(){
      this.geolocation.getCurrentPosition().then((resp) => {
          this.geoLatitude = resp.coords.latitude;
          this.geoLongitude = resp.coords.longitude; 
          this.geoAccuracy = resp.coords.accuracy; 
          this.getGeoencoder(this.geoLatitude,this.geoLongitude);
      }).catch((error) => {
          console.log('Error getting location'+ JSON.stringify(error));
      });
  }

  /**
   * NestoApp#159 / NestoAPI#578: el código postal de donde está el móvil, por la API (antes, el plugin
   * nativegeocoder). Si no llega, se queda el que hubiera.
   */
  getGeoencoder(latitude, longitude) {
      this.direcciones.desdeCoordenadas(latitude, longitude).subscribe(direccion => {
          this.seleccionarCodigoPostalActual(direccion?.CodigoPostal);
      });
  }

  /** Pone «<< Ubicación Actual >>» en la lista si ese código postal no está, y lo selecciona. */
  public seleccionarCodigoPostalActual(codigoPostal: string | null | undefined): void {
      const codigo = (codigoPostal || '').toString().trim();
      if (!codigo) {
          return;
      }
      const codEncontrado = this.codigosPostalesSinVisitar.find(p => p.codigoPostal == codigo || p.CodigoPostal == codigo);
      if (codEncontrado == undefined) {
          this.codigosPostalesSinVisitar.push({
              codigoPostal: codigo,
              CodigoPostal: codigo,
              poblacion: '<< Ubicación Actual >>',
              Poblacion: '<< Ubicación Actual >>'
          });
      }
      this.codigoPostalSeleccionado = codigo;
  }

  resumirRapports() {
    if (this.generandoResumen) return; // Evita llamadas duplicadas
    this.generandoResumen = true; // Deshabilita el botón y cambia el texto
    this.firebaseAnalytics.logEvent("resumir_rapports", {cliente: this.numeroCliente, contacto: this.contactoSeleccionado});
    this.servicio.cargarResumenRapports(this.numeroCliente, this.contactoSeleccionado)
      .subscribe(async (resumen) => {
        const resumenConSaltos = resumen.replace(/\n/g, '<br>');
  
        const alert = await this.alertCtrl.create({
          header: 'Resumen de Rapports',
          message: `<div style="max-height: 300px; overflow-y: auto;">${resumenConSaltos}</div>`,
          buttons: ['Cerrar']
        });
  
        await alert.present();
        this.generandoResumen = false; // Habilita el botón nuevamente
      }, 
      () => {
        this.generandoResumen = false; // En caso de error, también habilitamos el botón
      });
  }
  
  async mostrarResumenVentas(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ModalResumenVentasComponent,
      componentProps: {
        cliente: this.numeroCliente,
        contacto: this.contactoSeleccionado
      }
    });
    this.firebaseAnalytics.logEvent("abrir_resumen_ventas_modal", {cliente: this.numeroCliente, contacto: this.contactoSeleccionado});
    await modal.present();
  }

  public verRapportsDeCliente(cliente: string, contacto: string): void {
  // Guardamos el estado actual
  this.segmentoAnterior = this.segmentoRapports;
  this.clienteAnterior = this.numeroCliente;
  this.contactoAnterior = this.contactoSeleccionado;

  // Cambiamos al segmento de cliente
  this.numeroCliente = cliente;
  this.contactoSeleccionado = contacto;
  this.segmentoRapports = 'cliente';
  
  // Llamamos la función que carga los rapports (si no se lanza automáticamente)
  this.actualizarCliente();
  this.cargarDatosCliente(cliente, contacto);
}

public volverASegmentoAnterior(): void {
    if (this.segmentoAnterior) {
      this.segmentoRapports = this.segmentoAnterior;
      this.segmentoAnterior = null;
  
      // Restauramos cliente/contacto si hace falta
      this.numeroCliente = this.clienteAnterior ?? '';
      this.contactoSeleccionado = this.contactoAnterior ?? '';
      this.clienteAnterior = null;
      this.contactoAnterior = null;
    }
  }
  



  public inicializarLosDatos(datos:any[]) {
      super.inicializarDatos(datos);
  }
}
