import { OrigenCliente, textoOrigenCliente } from 'src/app/models/origen-cliente.model';
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { AlertController, NavController, ModalController } from '@ionic/angular';
import { Usuario } from 'src/app/models/Usuario';
import { Events } from 'src/app/services/events.service';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';
import { ClienteService } from './cliente.service';
import { ClientesMismoTelefonoComponent } from './clientes-mismo-telefono';
import { DireccionesService, textoCalleNumero } from '../../services/direcciones.service';
import { Geolocation } from '../../services/geolocation.service';
import { ActivatedRoute } from '@angular/router';
import { FirebaseAnalytics } from 'src/app/services/firebase-analytics.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { Subject, firstValueFrom, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { ApiErrorCode } from 'src/app/models/api-error.model';
import {
  BloqueDireccion, PREFIJO_ENTREGA, RevisionDireccion2, TEXTO_ENTREGA_EN_OTRA_DIRECCION, TITULO_NUMERO_SIN_GOOGLE,
  TITULO_REVISAR_DIRECCION2, aplicarDetalleGoogle, ayudaCodigoPostal, clienteParaCrear, clienteParaModificar,
  codigoPostalEditable, componerDireccion2, hayQueRevisarDireccion2, mensajeClienteCreado, motivoNoSePuedeModificar, motivoNoSePuedeSeguir,
  nuevaRevisionDireccion2, olvidarGoogle, puedeQuitarDireccion2, queEsTocado, quitarDireccion2, textoRevisarDireccion2
} from 'src/app/models/direccion-alta.model';

@Component({
    selector: 'app-cliente',
    templateUrl: './cliente.component.html',
    styleUrls: ['./cliente.component.scss'],
    standalone: false
})
export class ClienteComponent implements AfterViewInit {

  DATOS_FISCALES: number = 0;
  DATOS_GENERALES: number = 1;
  DATOS_COMISIONES: number = 2;
  DATOS_PAGO: number = 3;
  DATOS_CONTACTO : number = 4;

  private plazosPagoActuales: string;

  constructor(
      private servicio: ClienteService, 
      private alertCtrl: AlertController,
      private geolocation: Geolocation,
      private direcciones: DireccionesService,
      private usuario: Usuario,
      private nav: NavController,
      public modalCtrl: ModalController,
      public events: Events,
      private route: ActivatedRoute,
      private firebaseAnalytics: FirebaseAnalytics,
      private errorHandler: ErrorHandlerService,
  ){
      this.servicio.leerOrigenes().subscribe(origenes => this.origenes = origenes || []); // NestoApp#227
      if (this.route.snapshot.queryParams && this.route.snapshot.queryParams.empresa &&
        this.route.snapshot.queryParams.cliente && this.route.snapshot.queryParams.contacto) {
          // NestoApp#259: para abrir sus recogidas
          this.claveCliente = {
              empresa: this.route.snapshot.queryParams.empresa.toString().trim(),
              cliente: this.route.snapshot.queryParams.cliente.toString().trim(),
              contacto: this.route.snapshot.queryParams.contacto.toString().trim()
          };
          this.cargarCliente(
            this.route.snapshot.queryParams.empresa,
            this.route.snapshot.queryParams.cliente,
            this.route.snapshot.queryParams.contacto
          );
          if (!this.cliente.personasContacto) {
              this.cliente.personasContacto = [];
          }
      } else {
          this.cliente.esUnaModificacion = false;
          this.getGeolocation();
          this.annadirPersonaContacto();
      }

      if (this.route.snapshot.queryParams && this.route.snapshot.queryParams.nif && this.route.snapshot.queryParams.nombre) {
          this.cliente.nif = this.route.snapshot.queryParams.nif;
          this.cliente.nombre = this.route.snapshot.queryParams.nombre;
          this.goToDatosGenerales();
      }

      this.configurarBusquedaDireccion();
  }

  // Issue #152/#153: autocompletado de direcciones (Google Places vía proxy de NestoAPI).
  public sugerenciasDireccion: any[] = [];
  private terminoBusquedaDireccion$ = new Subject<string>();
  private sessionTokenDireccion: string = null;

  @ViewChild('iban') inputIban;
  @ViewChild('nif') inputNif;
  private inputDireccion: any;
  @ViewChild('direccion') set direccionProp(direccionProp:any) {
      this.inputDireccion = direccionProp;
  };

  slideActual: number = 0;

  cliente: any = {
      formaPago: "EFC",
      plazosPago: "CONTADO",
      personasContacto : [],
      iban: "",
      usuario: Configuracion.NOMBRE_DOMINIO + '\\' + this.usuario.nombre,
  };

  datosPagoValidados: boolean = false;
  
  mensajeDatosFiscales: string = "";

  // Variables de geolocalización
  geoLatitude: number;
  geoLongitude: number;
  geoAccuracy:number;

  ngAfterViewInit() {
      setTimeout(()=>{
          if (this.slideActual == this.DATOS_FISCALES){
              // Issue #134: el input #nif está bajo *ngIf, puede no existir en modificación
              // de cliente ya validado. Sin guard, casca con setFocus sobre undefined.
              this.inputNif?.setFocus();
          }
      },500)
  }

  // Issue #162 (NestoAPI#471 / #362): días de la semana que el centro abre, en
  // Clientes.DiasEnServir (char(5), L..V, '1'=abre / '0'=cierra). El picking no
  // sirve pedidos los días cerrados. Null/vacío/formato raro = '11111'.
  public readonly diasServir = [
      { indice: 0, nombre: 'Lunes' },
      { indice: 1, nombre: 'Martes' },
      { indice: 2, nombre: 'Miércoles' },
      { indice: 3, nombre: 'Jueves' },
      { indice: 4, nombre: 'Viernes' }
  ];

  private diasEnServirNormalizado(): string {
      const valor = this.cliente?.diasEnServir;
      return typeof valor === 'string' && /^[01]{5}$/.test(valor) ? valor : '11111';
  }

  public diaServirAbierto(indice: number): boolean {
      return this.diasEnServirNormalizado()[indice] === '1';
  }

  // Issue #196: los días que tiene la ficha en la BD, para dejarlos como estaban si al guardar
  // la API avisa de pedidos en picking y el vendedor no quiere avisar a almacén.
  private diasEnServirGuardados: string;

  public cambiarDiaServir(indice: number, abierto: boolean): void {
      const dias = this.diasEnServirNormalizado().split('');
      dias[indice] = abierto ? '1' : '0';
      this.cliente.diasEnServir = dias.join('');
  }

  annadirPersonaContacto() {
      const persona = {};
      this.cliente.personasContacto.push(persona);
  }

  borrarPersonaContacto(persona: any) {
      const index = this.cliente.personasContacto.indexOf(persona);
      if (index !== -1) this.cliente.personasContacto.splice(index, 1);
  }

  nombreDisabled(): boolean {
      return !this.cliente.nifValidado && this.cliente.nif 
          && '0123456789YX'.indexOf(this.cliente.nif.toUpperCase().trim()[0]) == -1;
  }
  
  goToDatosGenerales() {
      if (this.cliente.nifValidado) {
          this.pasarADatosGenerales();
          return;
      };
      if (!this.cliente.nif) {
          this.cliente.estado = 5;
          this.cliente.nifValidado;
          this.pasarADatosGenerales();
          return;
      }
      if (this.nombreDisabled()) {
          this.cliente.nombre=undefined;
      }
      this.servicio.validarNif(this.cliente.nif, this.cliente.nombre).subscribe(
          data => {
              if (data.nifFormateado != "UNDEFINED") {
                  this.cliente.nif = data.nifFormateado;
              }
              this.cliente.nombre = data.nombreFormateado;
              this.cliente.esContacto = data.existeElCliente;
              if (data.existeElCliente && !this.cliente.esUnaModificacion) {
                  this.cliente.empresa = data.empresa;
                  this.cliente.cliente = data.numeroCliente;
                  this.cliente.contacto = data.contacto;
              }
              this.cliente.estado = data.estadoCliente;
              this.cliente.nifValidado = data.nifValidado;
              
              if (data.nifValidado) {
                  this.pasarADatosGenerales();
                  this.mensajeDatosFiscales = "El NIF ya está validado, pero todavía puede modificar el nombre manualmente";
              } else {
                  this.mensajeDatosFiscales = "Error en el nombre o NIF, debe corregirlo para poder continuar";
              }
          },
          async error => {
              const alert = await this.alertCtrl.create({
                  message: 'Error',
                  subHeader: 'No se ha podido validar el NIF:\n' + this.motivoDelError(error),
                  buttons: ['Ok'],
              });
              await alert.present();
          }
      )    
  }

  /** NestoApp#259: el cliente que se está modificando (null en un alta). */
  public claveCliente: { empresa: string, cliente: string, contacto: string } | null = null;

  /** NestoApp#259 / NestoAPI#855: solicitar una recogida de este cliente (y ver las que tiene). */
  public abrirRecogidas(): void {
      if (!this.claveCliente) {
          return;
      }
      this.firebaseAnalytics.logEvent('cliente_abrir_recogidas', { cliente: this.claveCliente.cliente });
      this.nav.navigateForward('recogidas', { queryParams: { ...this.claveCliente, nombre: (this.cliente?.nombre || '').toString().trim() } });
  }

  private cargarCliente(empresa: string, cliente: string, contacto: string): void {
      this.servicio.leerClienteCrear(empresa, cliente, contacto).subscribe(
          data => {
              this.cliente = data;
              this.cliente.usuario = Configuracion.NOMBRE_DOMINIO + '\\' + this.usuario.nombre;
              this.cliente.esUnaModificacion = true;
              this.plazosPagoActuales = this.cliente.plazosPago;
              this.diasEnServirGuardados = this.cliente.diasEnServir;
              // NestoApp#290 / NestoAPI#874 corte 2: la Dirección 2 con la que se abre la ficha
              this.revision = nuevaRevisionDireccion2(this.cliente);
              this.goToDatosGenerales();
          },
          async error => {
              const alert = await this.alertCtrl.create({
                  message: 'Error',
                  subHeader: 'No se ha podido cargar el cliente ' + empresa + '/' + cliente + '/' + contacto + ':\n' +
                      this.motivoDelError(error),
                  buttons: ['Ok'],
              });
              await alert.present();
          }
      );
  }

  /**
   * Issue #181: desde que existe el interceptor, lo que llega al subscribe es un
   * ProcessedApiError, no el cuerpo de NestoAPI, así que la propiedad de siempre venía
   * undefined y el vendedor veía "No se ha podido cargar el cliente: undefined". Además
   * encadena las InnerException del formato antiguo, que es donde va el motivo de verdad.
   */
  /** NestoApp#227 / NestoAPI#623: orígenes de cliente (campañas) para el desplegable del alta. */
  public origenes: OrigenCliente[] = [];

  get textoOrigen(): string {
    return textoOrigenCliente(this.cliente?.origen, this.origenes);
  }

  private motivoDelError(error: any): string {
      return this.errorHandler.extractErrorDetail(error);
  }

  private pasarADatosGenerales() {
      this.slideActual = this.DATOS_GENERALES;
      setTimeout(() => {
          // Issue #134: input #direccion está bajo *ngIf="!cliente.direccion"; no se
          // renderiza cuando se modifica un cliente que ya tiene dirección.
          this.inputDireccion?.setFocus();
      }, 500);
  }

  /**
   * De «Datos generales» a «Comisiones». NestoApp#286 / #288 / #290: antes de seguir se comprueba lo que falta de la
   * dirección (número que Google no dio, código postal, «¿Qué es?»), se valida con la API la fiscal y, si se ha
   * marcado «La entrega es en otra dirección», también la de entrega, por el mismo camino.
   */
  async goToDatosComisiones(): Promise<void> {
      if (this.cliente.telefono == 'undefined') {
          this.cliente.telefono = '';
      }
      // Issue #180: sin dirección elegida de Google no se sigue (ya no vale escribirla a mano
      // y dejar que el backend geocodifique).
      if (this.faltaDireccionVerificada) {
          this.avisarDireccionSinVerificar();
          return;
      }
      if (this.esAlta) {
          const motivo = motivoNoSePuedeSeguir(this.cliente) ??
              (this.hayDireccionEntrega ? motivoNoSePuedeSeguir(this.direccionEntrega, true, PREFIJO_ENTREGA) : null);
          if (motivo) {
              await this.avisar('Faltan datos de la dirección', motivo);
              return;
          }
      }
      const direccionYaPuesta = this.cliente.direccion && !this.cliente.direccionCalleNumero;
      if (!direccionYaPuesta) {
          const data = await this.validarDireccion(this.cliente, '', true);
          if (!data) {
              return;
          }
          this.cliente.vendedorEstetica = data.vendedorEstetica;
          this.cliente.vendedorPeluqueria = data.vendedorPeluqueria;
          if (data.hayErrores) {
              return;
          }
          this.cliente.direccionValidada = true;
      }
      if (this.hayDireccionEntrega && !(this.direccionEntrega.direccion && this.direccionEntrega.direccionValidada)) {
          const mismoTelefono = (this.direccionEntrega.telefono || '').trim() === (this.cliente.telefono || '').trim();
          const data = await this.validarDireccion(this.direccionEntrega, PREFIJO_ENTREGA, !mismoTelefono);
          if (!data || data.hayErrores) {
              return;
          }
          this.direccionEntrega.direccionValidada = true;
      }
      if (!this.esAlta) {
          // NestoApp#290: si ha cambiado la calle y tenía «¿Qué es?», no se sigue sin revisarlo.
          if (hayQueRevisarDireccion2(this.cliente, this.revision)) {
              await this.preguntarRevisarDireccion2();
              if (hayQueRevisarDireccion2(this.cliente, this.revision)) {
                  return;
              }
          }
          const motivo = motivoNoSePuedeModificar(this.cliente, this.revision);
          if (motivo) {
              await this.avisar('Faltan datos de la dirección', motivo);
              return;
          }
      }
      this.slideActual = this.DATOS_COMISIONES;
  }

  /**
   * Valida una dirección con la API (la fiscal o la de entrega: el mismo camino) y deja en el bloque la dirección
   * formateada, la población, la provincia, la ruta y el teléfono. Devuelve la respuesta, o null si no se sigue.
   * NestoAPI#874: si Google no encuentra el número que se ha tecleado, no bloquea: se pregunta.
   */
  private async validarDireccion(bloque: BloqueDireccion, prefijo: string, avisarMismoTelefono: boolean): Promise<any> {
      let data: any;
      try {
          data = await firstValueFrom(this.servicio.validarDatosGenerales(bloque));
      } catch (error) {
          await this.avisar('Error', prefijo + 'No se ha podido validar la dirección:\n' + this.motivoDelError(error));
          return null;
      }
      data = data || {};
      if (bloque.numeroSinDarPorGoogle && data.numeroSinConfirmarPorGoogle && !bloque.numeroConfirmadoSinGoogle) {
          if (!(await this.preguntar(TITULO_NUMERO_SIN_GOOGLE, prefijo + (data.avisoNumero || '')))) {
              return null; // se queda en «Datos generales» para corregir el número
          }
          bloque.numeroConfirmadoSinGoogle = true;
      }
      // NestoApp#286: solo calle y número (lo demás va en «¿Qué es?», que es la Dirección 2).
      bloque.direccion = (data.direccionFormateada || '').substr(0, 50);
      // NestoApp#270: con un CP nuevo la API devuelve lo que se le mandó (o null si no
      // se le mandó nada): no se pisan los valores de Google con un null.
      bloque.poblacion = data.poblacion ?? bloque.poblacion;
      bloque.provincia = data.provincia ?? bloque.provincia;
      bloque.ruta = data.ruta;
      bloque.telefono = data.telefonoFormateado;
      if (data.clientesMismoTelefono && data.clientesMismoTelefono.length > 0) {
          data.clientesMismoTelefono = data.clientesMismoTelefono.filter(c => c.cliente != this.cliente.cliente);
      }
      if (avisarMismoTelefono && data.clientesMismoTelefono && data.clientesMismoTelefono.length > 0) {
          const clientesModal = await this.modalCtrl.create({
            component: ClientesMismoTelefonoComponent,
            componentProps: { listaClientes: data.clientesMismoTelefono }
          });
          await clientesModal.present();
      }
      return data;
  }

  private async avisar(titulo: string, mensaje: string): Promise<void> {
      const alert = await this.alertCtrl.create({ header: titulo, message: mensaje, buttons: ['Ok'] });
      await alert.present();
  }

  /** Pregunta de Sí/No; true solo si contesta «Sí». */
  private async preguntar(titulo: string, mensaje: string): Promise<boolean> {
      const alert = await this.alertCtrl.create({
          header: titulo,
          message: mensaje,
          backdropDismiss: false,
          buttons: [{ text: 'No', role: 'cancel' }, { text: 'Sí', role: 'si' }]
      });
      await alert.present();
      const resultado = await alert.onDidDismiss();
      return resultado?.role === 'si';
  }

  // ------------------------------------------------------------------ NestoApp#286 / #288 / #290: «¿Qué es?» y entrega

  /** Se está creando (un cliente nuevo o un contacto), no modificando una ficha. */
  get esAlta(): boolean {
      return !this.cliente?.esUnaModificacion;
  }

  /** NestoApp#288: al crear, el código postal no se teclea salvo que Google no lo dé. */
  get codigoPostalEditable(): boolean { return codigoPostalEditable(this.cliente, this.esAlta); }
  get ayudaCodigoPostal(): string { return ayudaCodigoPostal(this.cliente, this.esAlta); }

  /** Para el resumen de «compruebe los datos»: cómo quedará la Dirección 2 (la nueva o, sin tocar, la guardada). */
  get direccion2Resumen(): string {
      if (this.revision?.quitar) {
          return '';
      }
      return componerDireccion2(this.cliente).direccion2 || (this.esAlta ? '' : this.revision?.direccion2Guardada || '');
  }

  get direccion2EntregaResumen(): string {
      return componerDireccion2(this.direccionEntrega).direccion2 || '';
  }

  /** Otro número: hay que volver a preguntar a Google. */
  public numeroCambiado(): void {
      this.cliente.numeroConfirmadoSinGoogle = false;
  }

  /** NestoApp#288 / NestoAPI#879: «La entrega es en otra dirección» (solo al crear un cliente nuevo, no un contacto). */
  public readonly textoEntregaEnOtraDireccion = TEXTO_ENTREGA_EN_OTRA_DIRECCION;
  public entregaEnOtraDireccion: boolean = false;
  public direccionEntrega: BloqueDireccion = {};

  get puedeIndicarEntregaEnOtraDireccion(): boolean {
      return this.esAlta && !this.cliente?.esContacto;
  }

  get hayDireccionEntrega(): boolean {
      return this.entregaEnOtraDireccion && this.puedeIndicarEntregaEnOtraDireccion;
  }

  public cambiarEntregaEnOtraDireccion(valor: boolean): void {
      this.entregaEnOtraDireccion = !!valor;
      if (valor && !(this.direccionEntrega.telefono || '').trim() && this.cliente.telefono && this.cliente.telefono !== 'undefined') {
          this.direccionEntrega.telefono = this.cliente.telefono; // se propone el de la fiscal; se puede cambiar
      }
  }

  /** NestoApp#290 / NestoAPI#874 corte 2: la revisión de «¿Qué es?» al modificar (null en un alta). */
  private revision: RevisionDireccion2 | null = null;

  get avisoRevisarDireccion2(): string | null {
      return hayQueRevisarDireccion2(this.cliente, this.revision) ? textoRevisarDireccion2(this.revision.direccion2Guardada) : null;
  }

  get puedeQuitarDireccion2(): boolean {
      return !this.esAlta && puedeQuitarDireccion2(this.cliente, this.revision);
  }

  get seQuitaraDireccion2(): boolean {
      return !!this.revision?.quitar;
  }

  /** El vendedor ha cambiado «¿Qué es?» (al modificar cuenta como revisado). */
  public queEsCambiado(): void {
      queEsTocado(this.cliente, this.revision);
  }

  /** «Sigue siendo así»: lo que pone en «¿Qué es?» también vale para la dirección nueva. */
  public confirmarDireccion2(): void {
      if (this.revision) {
          this.revision.revisada = true;
      }
  }

  /** «Quitar»: el cliente se queda sin «¿Qué es?» (se borra al guardar). */
  public quitarDireccion2(): void {
      if (this.revision) {
          quitarDireccion2(this.cliente, this.revision);
      }
  }

  private async preguntarRevisarDireccion2(): Promise<void> {
      const alert = await this.alertCtrl.create({
          header: TITULO_REVISAR_DIRECCION2,
          message: textoRevisarDireccion2(this.revision.direccion2Guardada),
          backdropDismiss: false,
          buttons: [
              { text: 'Cambiarlo', role: 'cancel' },
              { text: 'Quitar', handler: () => this.quitarDireccion2() },
              { text: 'Sigue siendo así', handler: () => this.confirmarDireccion2() }
          ]
      });
      await alert.present();
      await alert.onDidDismiss();
  }

  goToDatosPago() {
      this.slideActual = this.DATOS_PAGO;
  }

  goToDatosContacto() {
      const datosPago: any = {
          formaPago: this.cliente.formaPago,
          ibanBruto: this.cliente.iban,
          plazosPago: this.cliente.plazosPago
      }
      this.servicio.validarDatosPago(datosPago).subscribe( 
      async data => {
          this.cliente.iban = data.ibanFormateado;
          if (data.datosPagoValidos || (data.ibanValido && this.cliente.plazosPago == this.plazosPagoActuales)) {
              this.slideActual = this.DATOS_CONTACTO;
          } else if (!data.ibanValido) {
              const alert = await this.alertCtrl.create({
                  header: 'Error',
                  message: 'IBAN no válido',
                  buttons: ['Ok'],
              });
              await alert.present();
          } else {
              const alert = await this.alertCtrl.create({
                  header: 'Error',
                  message: 'Error en los datos de pago',
                  buttons: ['Ok'],
              });
              await alert.present();
          }
      },
      async error => {
          const alert = await this.alertCtrl.create({
              header: 'Error',
              message: 'Error en la validación del IBAN:\n' + this.motivoDelError(error),
              buttons: ['Ok'],
          });
          await alert.present();
      })
  }

  finalizar() {
      // Issue #180: backstop del bloqueo duro, por si se llega aquí sin pasar por la slide.
      if (this.faltaDireccionVerificada) {
          this.avisarDireccionSinVerificar();
          return;
      }
      // NestoApp#286 / #290: backstop de «¿Qué es?», el número y la dirección de entrega.
      const motivo = this.esAlta
          ? motivoNoSePuedeSeguir(this.cliente) ??
              (this.hayDireccionEntrega ? motivoNoSePuedeSeguir(this.direccionEntrega, true, PREFIJO_ENTREGA) : null)
          : motivoNoSePuedeModificar(this.cliente, this.revision);
      if (motivo) {
          this.avisar('Faltan datos de la dirección', motivo);
          return;
      }
      if (this.cliente.formaPago == "EFC") {
          this.cliente.iban = "";
      }
      // Issue #180 / NestoAPI#499: el flag tiene que viajar siempre (JSON.stringify se come
      // los undefined), para que el servidor pueda rechazar altas sin dirección verificada.
      this.cliente.direccionVerificada = !!this.cliente.direccionVerificada;
      if (this.cliente.esUnaModificacion) {
          this.modificarCliente();
      } else {
          this.crearCliente();
      }
  }

  crearCliente() {
      // Issue #168: si lo que se está creando es un contacto de un cliente que ya existe,
      // al terminar se ofrece copiarle las personas de contacto y los CCC del principal.
      const esContactoNuevo: boolean = !!this.cliente.esContacto && !this.cliente.esUnaModificacion;
      // NestoApp#286 / #288: «¿Qué es?», el número propio y, si se ha marcado, la dirección de entrega.
      const alta = clienteParaCrear(this.cliente, this.hayDireccionEntrega ? this.direccionEntrega : null);
      this.servicio.crearCliente(alta).subscribe(
          async data => {
              this.firebaseAnalytics.logEvent("crear_cliente", {cliente: data.Nº_Cliente, contacto: data.Contacto, "screen_name": "Cliente"});
              const alert = await this.alertCtrl.create({
                  message: 'Cliente',
                  subHeader: mensajeClienteCreado(data),
                  buttons: ['Ok'],
              });
              await alert.present();
              await alert.onDidDismiss();
              if (esContactoNuevo) {
                  await this.preguntarCopiarDatosDelPrincipal(data.Empresa, data.Nº_Cliente, data.Contacto);
              }
              this.cliente = {
                  formaPago: "EFC",
                  plazosPago: "CONTADO",
                  personasContacto : [],
                  iban: "",
                  usuario: Configuracion.NOMBRE_DOMINIO + '\\' + this.usuario.nombre,
              };
              this.entregaEnOtraDireccion = false;
              this.direccionEntrega = {};
              this.mensajeDatosFiscales = "";
              this.slideActual = this.DATOS_FISCALES;
              
          },
          async error => {
              const textoExcepcion: string = this.motivoDelError(error);
              const alert = await this.alertCtrl.create({
                  header: 'Error',
                  message: 'No se ha podido crear el cliente:\n' + textoExcepcion,
                  buttons: ['Ok'],
              });
              await alert.present();
             }
      )
  }

  /**
   * Issue #168 (NestoAPI#438): la pregunta que antes se le hacía por correo a administración.
   * Solo sale al crear un contacto de un cliente que ya existía, y no bloquea nada: si se
   * contesta que no, el contacto se queda como se ha creado.
   */
  private async preguntarCopiarDatosDelPrincipal(empresa: string, cliente: string, contacto: string): Promise<void> {
      const confirm = await this.alertCtrl.create({
          header: 'Contacto creado',
          message: '¿Desea copiar las personas de contacto y los CCC del contacto principal al nuevo contacto?',
          buttons: [
              {
                  text: 'No',
                  role: 'cancel'
              },
              {
                  text: 'Sí',
                  handler: () => {
                      this.copiarDatosDelPrincipal(empresa, cliente, contacto);
                  }
              }
          ]
      });
      await confirm.present();
  }

  public copiarDatosDelPrincipal(empresa: string, cliente: string, contacto: string): void {
      this.servicio.copiarDatosDelPrincipal(empresa, cliente, contacto).subscribe(
          async data => {
              this.firebaseAnalytics.logEvent("copiar_datos_contacto_principal", {cliente: cliente, contacto: contacto});
              const personas: number = data && data.personasCopiadas ? data.personasCopiadas : 0;
              const cccs: number = data && data.cccsCopiados ? data.cccsCopiados : 0;
              const alert = await this.alertCtrl.create({
                  header: 'Contacto',
                  message: 'Se han copiado ' + personas + ' personas de contacto y ' + cccs + ' cuentas bancarias del contacto principal.',
                  buttons: ['Ok'],
              });
              await alert.present();
          },
          async error => {
              const alert = await this.alertCtrl.create({
                  header: 'Error',
                  message: 'No se han podido copiar los datos del contacto principal:\n' + this.motivoDelError(error),
                  buttons: ['Ok'],
              });
              await alert.present();
          }
      );
  }

  /**
   * Issue #196 (NestoAPI#541): `confirmarDiasConPicking` solo va a true en el reenvío tras
   * contestar «Avisar a almacén»; si fuera siempre, almacén recibiría correos sin que nadie lo
   * hubiera decidido. Se sale de la ficha solo si se ha guardado: con un error el vendedor sigue
   * en ella y no pierde lo que ha cambiado.
   */
  modificarCliente(confirmarDiasConPicking: boolean = false) {
      // NestoApp#290: «¿Qué es?» solo viaja si se ha tocado (o «Quitar»); si no, la API conserva lo guardado.
      const ficha = clienteParaModificar(this.cliente, this.revision);
      const cliente = confirmarDiasConPicking
          ? { ...ficha, confirmarDiasEnServirConPicking: true }
          : ficha;
      this.servicio.modificarCliente(cliente).subscribe(
          async data => {
            this.firebaseAnalytics.logEvent("modificar_cliente", {cliente: data.Nº_Cliente, contacto: data.Contacto});
              const alert = await this.alertCtrl.create({
                  header: 'Cliente',
                  message: 'Se ha modificado correctamente el cliente: ' 
                  + data.Nº_Cliente + '/'+data.Contacto,
                  buttons: ['Ok'],
              });
              await alert.present();
              this.events.publish('clienteModificado', {
                  empresa: data.Empresa.trim(),
                  cliente: data.Nº_Cliente.trim(),
                  contacto: data.Contacto.trim(),
                  cifNif: data.CIF_NIF,
                  nombre: data.Nombre,
                  direccion: data.Dirección,
                  codigoPostal: data.CodPostal,
                  poblacion: data.Población,
                  provincia: data.Provincia,
                  comentarios: data.Comentarios,
                  telefono: data.Teléfono,
                  estado: data.Estado
              });
              this.cliente = {
                  formaPago: "EFC",
                  plazosPago: "CONTADO",
                  personasContacto : [],
                  iban: "",
                  usuario: Configuracion.NOMBRE_DOMINIO + '\\' + this.usuario.nombre,
              };
              this.nav.pop();
          },
          async error => {
              const diasConPicking = this.leerDiasConPicking(error);
              if (diasConPicking) {
                  await this.preguntarAvisarAlmacen(diasConPicking);
                  return;
              }
              const textoExcepcion: string = this.motivoDelError(error);
              const alert = await this.alertCtrl.create({
                  header: 'Error',
                  message: 'No se ha podido modificar el cliente:\n' + textoExcepcion,
                  buttons: ['Ok'],
              });
              await alert.present();
          }
      )
  }

  /** Issue #196: el mensaje del 400 DIAS_CON_PICKING, o null si el error es otro. */
  private leerDiasConPicking(error: any): string | null {
      const apiError = error?.apiError?.error;
      if (!apiError || apiError.code !== ApiErrorCode.DIAS_CON_PICKING) {
          return null;
      }
      return apiError.message ||
          'Este cliente tiene pedidos en preparación que van a salir igual aunque ahora cierre ese día. ¿Avisamos a almacén? Si no, el cambio de días no se guarda.';
  }

  /** Issue #196: la API no ha guardado nada; «Sí» reenvía con la confirmación, «No» deshace los días. */
  private async preguntarAvisarAlmacen(mensaje: string): Promise<void> {
      const alert = await this.alertCtrl.create({
          header: 'Pedidos en preparación',
          message: mensaje,
          backdropDismiss: false,
          buttons: [
              {
                  text: 'Cancelar',
                  role: 'cancel',
                  handler: () => {
                      this.cliente.diasEnServir = this.diasEnServirGuardados;
                  }
              },
              {
                  text: 'Avisar a almacén',
                  handler: () => {
                      this.modificarCliente(true);
                  }
              }
          ]
      });
      await alert.present();
  }

  seleccionarFormaPago(event: any) {
      this.cliente.formaPago = event;
      if (this.cliente.formaPago == "RCB") {
          setTimeout(() => {
              // Issue #134: input #iban está bajo *ngIf="cliente.formaPago == 'RCB'",
              // tarda en renderizar; el setTimeout no garantiza que ya esté en el DOM.
              this.inputIban?.setFocus();
          }, 500);
      }
  }

  /**
   * Issue #180: la dirección que ofrece Google se selecciona, no se escribe. Mientras esté
   * elegida, el campo de calle y número va readonly (que no disabled: así se lee bien y se
   * puede copiar); para cambiarla hay que borrarla con el botón de al lado.
   */
  get direccionBloqueada(): boolean {
      return !!this.cliente?.direccionVerificada;
  }

  /**
   * Issue #180: no se guarda un cliente cuya dirección no venga elegida de Google. Solo
   * aplica mientras se está metiendo una dirección: si la ficha ya la tiene formateada y no
   * se toca (modificación normal), no se pide nada.
   */
  get faltaDireccionVerificada(): boolean {
      return !this.cliente?.direccion && !this.cliente?.direccionVerificada;
  }

  private async avisarDireccionSinVerificar(): Promise<void> {
      const alert = await this.alertCtrl.create({
          header: 'Falta la dirección',
          message: 'Elija la dirección de la lista que ofrece Google. Lo demás ' +
              '(piso, local, rótulo, referencias) va en «¿Qué es?».',
          buttons: ['Ok'],
      });
      await alert.present();
  }

  /**
   * Issue #180: vacía la calle y número para poder buscar otra dirección. Es el botón que
   * está junto al campo cuando la dirección ya viene elegida de Google.
   */
  public limpiarDireccion(): void {
      olvidarGoogle(this.cliente); // NestoApp#286: también el número y el CP que Google no dio
      this.sugerenciasDireccion = [];
      this.sessionTokenDireccion = null;
      setTimeout(() => {
        // Issue #134: protegemos por consistencia con los demás setFocus del componente.
        this.inputDireccion?.setFocus();
    }, 500);
  }

  editarDireccion() {
      this.cliente.direccion = "";
      // Issue #153: al reeditar la dirección se pierde la verificación de Places.
      this.limpiarDireccion();
  }

  /**
   * Issue #152/#153: cada pulsación de tecla en la dirección lanza (con debounce) una
   * búsqueda de sugerencias en Places. Al teclear a mano la dirección deja de estar
   * verificada, de modo que el backend vuelve a validar con geocoding si no se elige nada.
   */
  public buscarDireccion(evento: any): void {
      const texto = evento?.detail?.value ?? '';
      this.cliente.direccionVerificada = false;
      this.cliente.codigoPostalSinDarPorGoogle = false;
      this.cliente.numeroSinDarPorGoogle = false;
      this.terminoBusquedaDireccion$.next(texto);
  }

  private configurarBusquedaDireccion(): void {
      this.terminoBusquedaDireccion$.pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((texto: string) => {
              if (!texto || texto.trim().length < 3) {
                  return of([]);
              }
              if (!this.sessionTokenDireccion) {
                  this.sessionTokenDireccion = this.generarSessionToken();
              }
              return this.servicio.buscarSugerenciasDireccion(texto.trim(), this.sessionTokenDireccion)
                  .pipe(catchError(() => of([])));
          })
      ).subscribe((sugerencias: any[]) => {
          this.sugerenciasDireccion = sugerencias || [];
      });
  }

  public seleccionarSugerenciaDireccion(sugerencia: any): void {
      this.servicio.leerDetalleDireccion(sugerencia.placeId, this.sessionTokenDireccion).subscribe(
          (detalle: any) => {
              // NestoApp#271 / NestoAPI#826: la API ya compone calle y número en el formato del país.
              // NestoApp#286 / #288: sin código postal se teclea; sin número, se pide aparte (direccion-alta.model).
              aplicarDetalleGoogle(this.cliente, detalle);
              this.sugerenciasDireccion = [];
              // La sesión de Places termina con el Detalle: la próxima búsqueda abre una nueva.
              this.sessionTokenDireccion = null;
              this.firebaseAnalytics.logEvent('cliente_direccion_places_seleccionada', {});
          },
          async error => {
              const alert = await this.alertCtrl.create({
                  header: 'Error',
                  message: 'No se ha podido obtener el detalle de la dirección',
                  buttons: ['Ok'],
              });
              await alert.present();
          }
      );
  }

  private generarSessionToken(): string {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
      });
  }

  // Funciones de geolocalización
  //Get current coordinates of device
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
   * NestoApp#159 / NestoAPI#578: la dirección de donde está el móvil, por la API (antes, el plugin
   * nativegeocoder). Solo rellena lo que llega; si no hay dirección, los campos se quedan como estaban.
   */
  getGeoencoder(latitude, longitude) {
      this.direcciones.desdeCoordenadas(latitude, longitude).subscribe(direccion => {
          if (!direccion) {
              return;
          }
          if (direccion.CodigoPostal) {
              this.cliente.codigoPostal = direccion.CodigoPostal;
          }
          const calle = textoCalleNumero(direccion);
          if (calle) {
              this.cliente.direccionCalleNumero = calle;
          }
      });
  }

  public seleccionarTexto(evento: any): void {
    const nativeInputEle = evento.target;
    nativeInputEle.getInputElement().then(
      a => a.select()
    )
  }
}
