import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirebaseAnalytics } from 'src/app/services/firebase-analytics.service';
import { NavParams, AlertController, LoadingController, NavController } from '@ionic/angular';
import { Usuario } from 'src/app/models/Usuario';
import { Events } from 'src/app/services/events.service';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';
import { RapportService } from './rapport.service';
import { AuthService, SesionOutlookCaducadaError } from '../../auth.service';
import { User } from '../../user';
import { VersionNativoService } from 'src/app/services/version-nativo.service';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';

@Component({
    selector: 'app-rapport',
    templateUrl: './rapport.component.html',
    styleUrls: ['./rapport.component.scss'],
    standalone: false
})
export class RapportComponent {
  public rapport: any;
  public errorMessage: string;
  public numeroCliente: string;
  modificando: boolean = false;
  dejarDeVisitar: boolean = false;
  private vendedorEstetica: string;
  private vendedorPeluqueria: string;
  public fechaCita: string;

  /*
  private readonly _destroying$ = new Subject<void>();


  */
  constructor(
    private servicio: RapportService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private usuario: Usuario,
    public events: Events,
    private nav: NavController,
    private route: ActivatedRoute,
    private firebaseAnalytics: FirebaseAnalytics,
    private authService: AuthService,
    private versionNativo: VersionNativoService
    ) {
      // Issue #135: en build Web los queryParams se serializan a string. Si llega "[object Object]"
      // (porque navegaron con un objeto como queryParam) el código de abajo casca al intentar
      // crear propiedades sobre un string. Caemos a un rapport vacío para no reventar la pantalla.
      const rapportParam = this.route.snapshot.queryParams.rapport;
      this.rapport = (rapportParam && typeof rapportParam === 'object') ? rapportParam : {};
      this.numeroCliente = this.rapport.Cliente;
      if (!this.rapport.Id) {
          this.rapport.Tipo = usuario.ultimoTipoRapport;
      }
  }

  submitted = false;
  onSubmit() { this.submitted = true; }
  
  @ViewChild('cliente') inputCliente;
  ngAfterViewInit() {
      setTimeout(()=>{
          this.inputCliente.setFocus();
      },500)
  }
  
  /*
  ngOnInit(): void {
    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.authService.checkAndSetActiveAccount();
      })
  }
  */

  public leerCliente(cliente: string, contacto: string): void {
      this.servicio.getCliente(cliente, contacto).subscribe(
          async data => {
              if (data.length === 0) {
                  let alert: any = await this.alertCtrl.create({
                      subHeader: 'Error',
                      message: 'No se puede cargar el cliente ' + this.rapport.Cliente,
                      buttons: ['Ok'],
                  });
                  await alert.present();
              } else {
                  this.rapport.Cliente = data.cliente;
                  //this.rapport.Contacto = data.contacto;
                  this.rapport.Direccion = data.direccion;
                  this.rapport.Nombre = data.nombre;
                  this.rapport.EstadoCliente = data.estado;
                  this.vendedorEstetica = data.vendedor.trim();
                  this.vendedorPeluqueria = "";
                  if (data.VendedoresGrupoProducto && data.VendedoresGrupoProducto[0]) {
                      this.vendedorPeluqueria = data.VendedoresGrupoProducto[0].vendedor.trim();
                  }
                  if (this.vendedorEstetica != Configuracion.VENDEDOR_GENERAL && this.vendedorPeluqueria == Configuracion.VENDEDOR_GENERAL) {
                      this.rapport.TipoCentro = 1; // Solo estética
                  } else if (this.vendedorEstetica == Configuracion.VENDEDOR_GENERAL && this.vendedorPeluqueria != Configuracion.VENDEDOR_GENERAL) {
                      this.rapport.TipoCentro = 2; // Solo peluquería
                  } else if (this.vendedorEstetica != Configuracion.VENDEDOR_GENERAL && this.vendedorPeluqueria != Configuracion.VENDEDOR_GENERAL) {
                      this.rapport.TipoCentro = 3; // Estética y peluquería
                  } else {
                      this.rapport.TipoCentro = 0; // No sabemos qué es
                  }
              }
          },
          error => {
              this.errorMessage = <any>error;
          },
          () => {

          })
  }

  public leerClientePrincipal(): void {
      this.leerCliente(this.numeroCliente, '');
  }

  public async modificarRapport(): Promise<void> {

      let confirm = await this.alertCtrl.create({
          header: 'Confirmar',
          message: '¿Está seguro que quiere guardar el rapport?',
          buttons: [
              {
                  text: 'Sí',
                  handler: async () => {
                      this.modificando = true;
                      if (!this.mostrarEstadoCliente) {
                          this.rapport.TipoCentro = 0; // no se sabe
                      }
                      let loading: any = await this.loadingCtrl.create({
                          message: 'Guardando Rapport...',
                      });

                      await loading.present();

                      this.servicio.crearRapport(this.rapport).subscribe(
                          async data => {
                              if (data) {
                                this.rapport.Id = data.NºOrden;
                              }
                            this.firebaseAnalytics.logEvent("rapport_crear", {cliente: this.rapport.Cliente, contacto: this.rapport.Contacto});
                              let alert = await this.alertCtrl.create({
                                  header: 'Creado',
                                  message: 'Rapport guardado correctamente',
                                  buttons: ['Ok'],
                              });
                              await alert.present();
                              if (this.dejarDeVisitar) {
                                  this.servicio.dejarDeVisitar(this.rapport, this.vendedorEstetica, this.vendedorPeluqueria).subscribe(
                                      async data => {
                                        this.firebaseAnalytics.logEvent("rapport_dejar_de_visitar", {cliente: this.rapport.Cliente, contacto: this.rapport.Contacto});
                                          let alertOK = await this.alertCtrl.create({
                                              header: 'Clientes',
                                              message: 'Se ha sacado el cliente de la cartera',
                                              buttons: ['Ok'],
                                          });
                                          await alertOK.present();
                                          this.nav.pop();
                                      },
                                      async error => {
                                          let alertKO = await this.alertCtrl.create({
                                              header: 'Error',
                                              message: 'No se ha podido quitar el cliente.\n' + error.ExceptionMessage,
                                              buttons: ['Ok'],
                                          });
                                          await alertKO.present();
                                      },
                                      () => {
                                          //loading.dismiss();
                                      }
                                  );
                              }        
                              await loading.dismiss();
                              this.events.publish('rapportCreado', this.rapport);
                              this.modificando = false;
                              this.usuario.ultimoTipoRapport = this.rapport.Tipo;
                              if (!this.dejarDeVisitar) {
                                  this.nav.pop();
                              }
                          },
                          async error => {
                              let alert = await this.alertCtrl.create({
                                  header: 'Error',
                                  message: 'No se ha podido guardar el rapport.\n' + error.ExceptionMessage,
                                  buttons: ['Ok'],
                              });
                              await alert.present();
                              await loading.dismiss();
                              this.modificando = false;
                          },
                          () => {
                              //loading.dismiss();
                          }
                      );
                  }
              },
              {
                  text: 'No',
                  handler: () => {
                      return;
                  }
              }

          ]
      });

      await confirm.present();
  }

  public seleccionarContacto(evento: any): void {
      this.rapport.Contacto = evento.contacto;
      //this.rapport.EstadoCliente = evento.estado;
      this.leerCliente(this.rapport.Cliente, this.rapport.Contacto);
  }

  public seleccionarTexto(evento: any): void {
    var nativeInputEle = evento.target;
    nativeInputEle.getInputElement().then(
      a => a.select()
    )
  }

  public sePuedeModificar(): boolean {
      let usuarioActual: string = Configuracion.NOMBRE_DOMINIO + '\\' + this.usuario.nombre;
      var sePuedePorUsuario = !this.modificando && this.rapport && this.rapport.Usuario === usuarioActual;
      var sePuedePorDejarDeVisitar = !this.dejarDeVisitar || (this.rapport && this.rapport.Comentarios && this.rapport.Comentarios.length > 50);
      return sePuedePorUsuario && sePuedePorDejarDeVisitar;
  }

  public async mostrarEstadoCliente(estadoCliente: number): Promise<void> {
      if (estadoCliente == undefined) {
          return;
      }
      let alert: any = await this.alertCtrl.create({
          header: 'Info',
          message: 'El cliente está en estado ' + estadoCliente.toString(),
          buttons: ['Ok'],
      });
      await alert.present();
  }

  public mostrarTipoCentro(): boolean {
      return (this.rapport.Id == null || this.rapport.Id == 0) && this.vendedorEstetica == this.vendedorPeluqueria && this.vendedorEstetica == this.usuario.vendedor;
  }

  public async crearCita() {
    // Issue #88: la cita en Outlook necesita el binario nativo con el deep link msauth:// registrado.
    const apto = await this.versionNativo.cumpleVersionMinima(
      Configuracion.MIN_VERSION_CODE_OUTLOOK,
      'Crear cita en Outlook',
      Configuracion.MIN_VERSION_NAME_OUTLOOK
    );
    if (!apto) return;

    const timeZone = this.authService.user?.timeZone ?? 'UTC';
    const graphEvent: MicrosoftGraph.Event = {
        subject: "Aviso del cliente " + this.rapport.Cliente.trim() + "/" + this.rapport.Contacto.trim(),
        start: {
          dateTime: this.fechaCita,
          timeZone: timeZone
        },
        end: {
          dateTime: this.fechaCita,
          timeZone: timeZone
        }
      };

      if (this.rapport.Comentarios && this.rapport.Comentarios.length > 0) {
        graphEvent.body = {
          contentType: 'text',
          content: this.rapport.Comentarios.trim()
        };
      }

      graphEvent.isReminderOn = true;
      graphEvent.reminderMinutesBeforeStart = 0;

      try {
        await this.servicio.addEventToCalendar(graphEvent);
        this.firebaseAnalytics.logEvent("rapport_crear_cita", { cliente: this.rapport.Cliente, contacto: this.rapport.Contacto });
        let alert: any = await this.alertCtrl.create({
            header: 'Aviso',
            message: 'Se ha creado correctamente la cita del cliente ' + this.rapport.Cliente.trim(),
            buttons: ['Ok'],
        });
        await alert.present();
      } catch (error: any) {
        if (error instanceof SesionOutlookCaducadaError) {
          const alert = await this.alertCtrl.create({
            header: 'Sesión de Office caducada',
            message: 'Tu sesión de Office ha caducado. Vuelve a iniciar sesión para crear la cita.',
            buttons: [
              { text: 'Cancelar', role: 'cancel' },
              { text: 'Iniciar sesión', handler: () => this.signIn() }
            ]
          });
          await alert.present();
          return;
        }
        const alert = await this.alertCtrl.create({
            header: 'Error',
            message: 'No se ha podido crear la cita del cliente ' + this.rapport.Cliente.trim() + '.\n' + (error?.message || error),
            buttons: ['Ok'],
        });
        await alert.present();
      }
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

  // Is a user logged in?
  get authenticated(): boolean {
    return this.authService.authenticated;
  }
  // The user
  get user(): User | undefined {
    return this.authService.user;
  }

  async signIn(): Promise<void> {
    // Issue #88: la salvaguarda comprueba que el APK trae el intent-filter msauth:// necesario.
    const apto = await this.versionNativo.cumpleVersionMinima(
      Configuracion.MIN_VERSION_CODE_OUTLOOK,
      'Iniciar sesión en Office',
      Configuracion.MIN_VERSION_NAME_OUTLOOK
    );
    if (!apto) return;

    try {
      await this.authService.signIn();
      this.firebaseAnalytics.logEvent("outlook_sign_in", { usuario: this.usuario.nombre });
    } catch (e: any) {
      const alert = await this.alertCtrl.create({
        header: 'No se pudo iniciar sesión',
        message: e?.message || 'Error desconocido al autenticar con Microsoft.',
        buttons: ['Ok']
      });
      await alert.present();
    }
  }

  async signOut(): Promise<void> {
    await this.authService.signOut();
    this.firebaseAnalytics.logEvent("outlook_sign_out", { usuario: this.usuario.nombre });
  }
}
