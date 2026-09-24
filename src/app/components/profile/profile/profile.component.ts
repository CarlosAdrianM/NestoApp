import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { Usuario } from 'src/app/models/Usuario';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Parametros } from 'src/app/services/parametros.service';
import { Configuracion } from '../../configuracion/configuracion/configuracion.component';
import { Storage } from '@ionic/storage-angular';
import { FirebaseAnalytics } from 'src/app/services/firebase-analytics.service';
import { AppVersion } from 'src/app/services/app-version.service';
import { ProfileService } from './profile.service';
import { AppComponent } from 'src/app/app.component';
import { ActivatedRoute } from '@angular/router';
import { BuzonNotificacionesService, textoContador } from 'src/app/services/buzon-notificaciones.service';
import { GrupoNovedades, Novedad, NovedadesService, agruparPorVersion, colorCategoria, colorEstadoSugerencia } from 'src/app/services/novedades.service';
import { leerComoDataUrl } from 'src/app/utils/ajustar-imagen';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    standalone: false
})
export class ProfileComponent {

  private LOGIN_URL: string = Configuracion.URL_SERVIDOR + '/oauth/token';
  private SIGNUP_URL: string = Configuracion.URL_SERVIDOR + '/users';

  // When the page loads, we want the Login segment to be selected
  public authType: string = 'login';
  // We need to set the content type for the server
  private contentHeader: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
  });
  public error: string;
  public mostrarOlvideMiContrasenna: boolean;
  public correoContrasennaOlvidada: string;
  public numeroVersionBinarios: string;
  public numeroVersionActualizacion: string;
  public listaSeEstaVendiendo: any;
  // NestoApp#177: novedades desde la tabla Novedades de la API, agrupadas por versión.
  public gruposNovedades: GrupoNovedades[] = [];

  constructor(
      private http: HttpClient,
      public usuario: Usuario,
      private loadingCtrl: LoadingController,
      private local: Storage,
      private parametros: Parametros,
      private alertCtrl: AlertController,
      public auth: AuthService,
      private firebaseAnalytics: FirebaseAnalytics,
      private appVersion: AppVersion,
      private servicio: ProfileService,
      private nav: NavController,
      private appComponent: AppComponent,
      private novedadesService: NovedadesService,
      private route: ActivatedRoute,
      public buzon: BuzonNotificacionesService,
      ) {
          this.appVersion.getVersionNumber().then((ver) => this.numeroVersionBinarios = ver);
          this.numeroVersionActualizacion = Configuracion.VERSION;
          this.cargarNovedades();
          this.cargarSugerencias();
          // #193: la push «Te han contestado en Novedades» trae aquí ?novedad=…&comentario=…
          this.route.queryParamMap.subscribe(parametros => {
              const novedad = Number(parametros.get('novedad'));
              if (novedad) {
                  this.abrirAviso(novedad, Number(parametros.get('comentario')) || null);
              }
          });
        }

  /** NestoApp#192: al volver a la pantalla no se piden otra vez si se cargaron hace menos de esto. */
  private static readonly MINIMO_ENTRE_RECARGAS_MS = 60 * 1000;
  private ultimaCargaNovedades: number = 0;

  /**
   * Se resuelve siempre (también si falla), para poder cerrar el refresher. Si falla y ya había
   * novedades, se quedan las que había; la primera vez la sección simplemente no se pinta.
   */
  private cargarNovedades(): Promise<void> {
      this.ultimaCargaNovedades = Date.now();
      return new Promise<void>(resolve => {
          this.novedadesService.leerNovedades().subscribe({
              next: novedades => {
                  // #192: al refrescar se sigue viendo la misma versión (o las sugerencias), si sigue existiendo.
                  const versionVista = this.grupoNovedadesActual?.version;
                  this.gruposNovedades = agruparPorVersion(novedades);
                  if (!this.viendoSugerencias) {
                      const indice = this.gruposNovedades.findIndex(g => g.version === versionVista);
                      this.indiceVersionNovedades = indice >= 0 ? indice : 0;
                  }
                  resolve();
              },
              error: error => {
                  console.error('No se han podido cargar las novedades:', error);
                  resolve();
              }
          });
      });
  }

  // ---- NestoApp#190 / NestoAPI#526: sugerencias de los usuarios, por delante de la versión actual ----

  /** Las abiertas, en el orden de la API (👍 − 👎). */
  public sugerencias: Novedad[] = [];
  /** Sin el endpoint (API vieja o caída) no hay página de sugerencias. */
  public sugerenciasDisponibles: boolean = false;
  /** Capturas ya bajadas, por Id de sugerencia (data URL). */
  public imagenesSugerencias: { [idNovedad: number]: string } = {};

  private cargarSugerencias(): Promise<void> {
      return new Promise<void>(resolve => {
          this.novedadesService.leerSugerencias().subscribe({
              next: sugerencias => {
                  this.sugerencias = sugerencias;
                  this.sugerenciasDisponibles = true;
                  sugerencias.filter(s => s.TieneImagen && !this.imagenesSugerencias[s.Id]).forEach(s => this.cargarImagenSugerencia(s.Id));
                  resolve();
              },
              error: error => {
                  console.error('No se han podido cargar las sugerencias:', error);
                  resolve();
              }
          });
      });
  }

  private cargarImagenSugerencia(idNovedad: number): void {
      this.novedadesService.leerImagenNovedad(idNovedad).subscribe({
          next: async blob => { this.imagenesSugerencias[idNovedad] = await leerComoDataUrl(blob); },
          error: error => console.error('No se ha podido cargar la captura de la sugerencia', error)
      });
  }

  public async alCrearSugerencia(creada: Novedad): Promise<void> {
      await this.cargarSugerencias();
      await this.mostrarNovedad(creada.Id, null, creada);
  }

  public colorEstadoSugerencia(estado: string): string {
      return colorEstadoSugerencia(estado);
  }

  /** El texto del usuario solo se repite si dice más que el título (que es su primera línea). */
  public textoOriginalAparte(sugerencia: Novedad): boolean {
      const texto = (sugerencia.TextoOriginal || '').trim();
      return !!texto && texto !== (sugerencia.Titulo || '').trim();
  }

  // ---- NestoApp#190 / NestoAPI#527: buscador ----

  public textoBusqueda: string = '';
  /** null = no se está buscando (no se pinta la lista de resultados). */
  public resultadosBusqueda: Novedad[] | null = null;
  public buscandoNovedades: boolean = false;
  /** Para descartar las respuestas que lleguen tarde (se busca mientras se escribe). */
  private peticionBusqueda: number = 0;

  public buscarNovedades(texto: string): void {
      this.textoBusqueda = texto || '';
      const limpio = this.textoBusqueda.trim();
      const peticion = ++this.peticionBusqueda;
      if (limpio.length < 2) {
          this.resultadosBusqueda = null;
          this.buscandoNovedades = false;
          return;
      }
      this.buscandoNovedades = true;
      this.novedadesService.buscar(limpio).subscribe({
          next: resultados => {
              if (peticion === this.peticionBusqueda) {
                  this.resultadosBusqueda = resultados;
                  this.buscandoNovedades = false;
              }
          },
          error: error => {
              console.error('No se ha podido buscar en las novedades:', error);
              if (peticion === this.peticionBusqueda) {
                  this.resultadosBusqueda = [];
                  this.buscandoNovedades = false;
              }
          }
      });
  }

  public async irAResultado(resultado: Novedad): Promise<void> {
      this.buscarNovedades('');
      await this.mostrarNovedad(resultado.Id, resultado.Version, resultado);
  }

  // ---- Saltar a una novedad concreta: buscador (#190) y push de respuesta (#193) ----

  public novedadResaltada: number | null = null;
  private temporizadorResaltado: any = null;

  /**
   * Pone en pantalla la versión (o las sugerencias, si no tiene) de esa novedad, la lleva a la vista y
   * la resalta un rato. Si no está cargada, se recarga; una sugerencia cerrada (no sale en la lista
   * de abiertas) se enseña con los datos que ya se tienen (`respaldo`). false si no se encuentra.
   */
  public async mostrarNovedad(id: number, version: string | null, respaldo?: Novedad): Promise<boolean> {
      if (!version) {
          if (!this.sugerencias.some(s => s.Id === id)) {
              await this.cargarSugerencias();
          }
          if (!this.sugerencias.some(s => s.Id === id)) {
              if (!respaldo) {
                  return false;
              }
              this.sugerencias = [...this.sugerencias, respaldo];
              this.sugerenciasDisponibles = true;
          }
          this.indiceVersionNovedades = -1;
      } else {
          let indice = this.gruposNovedades.findIndex(g => g.version === version);
          if (indice < 0) {
              await this.cargarNovedades();
              indice = this.gruposNovedades.findIndex(g => g.version === version);
          }
          if (indice < 0) {
              return false;
          }
          this.indiceVersionNovedades = indice;
      }
      this.resaltar(id);
      return true;
  }

  private resaltar(id: number): void {
      this.novedadResaltada = id;
      // Tras pintar la versión elegida
      setTimeout(() => document.getElementById('novedad-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
      clearTimeout(this.temporizadorResaltado);
      this.temporizadorResaltado = setTimeout(() => this.novedadResaltada = null, 4000);
  }

  // ---- NestoApp#193: la push de respuesta (o de @mención) abre la novedad en el comentario ----

  /** El comentario al que lleva el aviso, para que su tarjeta abra los comentarios y lo resalte. */
  public avisoComentario: { novedadId: number; comentarioId: number } | null = null;

  /**
   * Se recarga todo antes (la respuesta es nueva: cifras frescas) y se salta a la versión de la
   * novedad o a las sugerencias. Sin comentario (una mención al sugerir) solo se enseña la novedad.
   */
  public async abrirAviso(novedadId: number, comentarioId: number | null): Promise<void> {
      await Promise.all([this.cargarNovedades(), this.cargarSugerencias()]);
      const version = this.versionDeNovedad(novedadId);
      if (version === undefined) {
          console.warn(`La novedad ${novedadId} del aviso ya no está en la lista`);
          return;
      }
      this.avisoComentario = comentarioId ? { novedadId, comentarioId } : null;
      await this.mostrarNovedad(novedadId, version);
  }

  /** La versión de una novedad cargada, null si es una sugerencia o undefined si no está. */
  private versionDeNovedad(id: number): string | null | undefined {
      const grupo = this.gruposNovedades.find(g => g.novedades.some(n => n.Id === id));
      if (grupo) {
          return grupo.version;
      }
      return this.sugerencias.some(s => s.Id === id) ? null : undefined;
  }

  public comentarioDelAviso(novedad: Novedad): number | null {
      return this.avisoComentario?.novedadId === novedad.Id ? this.avisoComentario.comentarioId : null;
  }

  /** #192: con el gesto de arrastrar se recarga todo lo que cambia solo, y se cierra al acabar. */
  public async refrescar(event: any): Promise<void> {
      await Promise.all([this.cargarSeEstaVendiendo(), this.cargarNovedades(), this.cargarSugerencias()]);
      event?.target?.complete();
  }

  ionViewWillEnter() {
      if (Date.now() - this.ultimaCargaNovedades >= ProfileComponent.MINIMO_ENTRE_RECARGAS_MS) {
          this.cargarNovedades();
          this.cargarSugerencias();
      }
  }

  /** Por Id: al refrescar, las tarjetas (con sus comentarios abiertos) no se vuelven a crear. */
  public idNovedad(_indice: number, novedad: Novedad): number {
      return novedad.Id;
  }

  // Como la ventana de Novedades de Nesto: una versión cada vez y flechas para las demás. Si no,
  // con el tiempo el perfil sería una lista interminable. 0 = la más reciente; -1 = las sugerencias
  // (#190), que van por delante de la versión actual.
  public indiceVersionNovedades: number = 0;

  get viendoSugerencias(): boolean {
      return this.indiceVersionNovedades === -1;
  }

  get hayNovedades(): boolean {
      return this.gruposNovedades.length > 0 || this.sugerenciasDisponibles;
  }

  get grupoNovedadesActual(): GrupoNovedades | undefined {
      return this.gruposNovedades[this.indiceVersionNovedades];
  }

  get hayVersionAnterior(): boolean {
      return this.indiceVersionNovedades < this.gruposNovedades.length - 1;
  }

  get hayVersionPosterior(): boolean {
      return this.indiceVersionNovedades > (this.sugerenciasDisponibles ? -1 : 0);
  }

  public verVersionAnterior(): void {
      if (this.hayVersionAnterior) {
          this.indiceVersionNovedades++;
      }
  }

  public verVersionPosterior(): void {
      if (this.hayVersionPosterior) {
          this.indiceVersionNovedades--;
      }
  }

  public colorCategoria(categoria: string): string {
      return colorCategoria(categoria);
  }

  @ViewChild('inputCorreoContrasenna') correoContrasenna: any;

  slideOpts = {
    initialSlide: 1,
    speed: 400,
    autoplay: {
        delay: 2000
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    }
  };

  ionViewDidEnter() {
    if(this.usuario && !this.usuario.nombre) {
        this.local.get('profile').then(profile => {
            console.log(profile);
            if (profile) {
                this.usuario.nombre = profile;
                this.firebaseAnalytics.setUserId(this.usuario.nombre);
                this.cargarParametros();
                this.cargarSeEstaVendiendo();
                this.appComponent.registrarDispositivoPush();
                this.buzon.refrescarContador(); // #176
            }
        }).catch(error => {
            console.log(error);
            //this.nav.push(ProfilePage);
        });
    }
  }

    /** Se resuelve siempre, para que el refresher se cierre aunque falle. */
    cargarSeEstaVendiendo(): Promise<void> {
        return new Promise<void>(resolve => {
            this.servicio.getSeEstaVendiendo().subscribe({
                next: data => { this.listaSeEstaVendiendo = Array.isArray(data) ? data : []; },
                error: err => {
                    console.error('SeEstaVendiendo error:', err);
                    resolve();
                },
                complete: () => resolve()
            });
        });
    }

  async login(credentials: any) {
    const loading: any = await this.loadingCtrl.create({
        message: 'Iniciando sesión...',
    })
    
    await loading.present();

    // credentials.grant_type = 'password';
    this.http.post(
        this.LOGIN_URL,
        'username=' + encodeURIComponent(credentials.username) +
        '&password=' + encodeURIComponent(credentials.password) +
        '&grant_type=password',
        {
            headers: this.contentHeader,
        })
        .subscribe(
        async data => {
            this.usuario.nombre = credentials.username;
            this.firebaseAnalytics.logEvent("login", {nombre: this.usuario.nombre});
            const datos: any = data;
            await this.authSuccess(datos.access_token, datos.refresh_token);
            this.cargarParametros();
            this.appComponent.registrarDispositivoPush();
            this.buzon.refrescarContador(); // #176
        },
        async err => {
            this.error = 'Se ha producido un error al intentar iniciar sesión',
            await loading.dismiss();
        },
        async () => {
            await loading.dismiss();
        }
    );
}

public signup(credentials: any): void {
    this.http.post(this.SIGNUP_URL, JSON.stringify(credentials), { headers: this.contentHeader })
        .subscribe(
        data => {
            const datos: any = data;
            this.authSuccess(datos.id_token);
        },
        err => this.error = err
    );
}

public logout(): void {
    this.local.remove('id_token');
    this.local.remove('refresh_token');
    this.local.remove('profile');
    this.firebaseAnalytics.logEvent("logout", {nombre: this.usuario.nombre});
    this.usuario.nombre = null;
    this.buzon.reiniciar(); // #176: el badge no se queda con los avisos del anterior
}

private async authSuccess(token: any, refreshToken?: any): Promise<void> {
    this.error = null;
    await this.local.set('id_token', token);
    if (refreshToken) {
        await this.local.set('refresh_token', refreshToken);
    } else {
        await this.local.remove('refresh_token');
    }
    await this.local.set('profile', this.usuario.nombre.trim());
    // Tras un login correcto, reanudar el manejo de sesión expirada para futuras caducidades.
    this.auth.resetSessionExpiredFlag();
}

private cargarParametros(): void {
    const self: any = this;

    this.parametros.leer('Vendedor').subscribe(
        data => {
            self.usuario.vendedor = data;
        },
        error => {
            console.log('No se ha podido cargar el vendedor por defecto');
            this.error = '¡Ups! Parece que no tienes conexión';
        }
    );

    this.parametros.leer('DelegaciónDefecto').subscribe(
        data => {
            self.usuario.delegacion = data;
        },
        error => {
            console.log('No se ha podido cargar la delegación por defecto');
            this.error = '¡Ups! Parece que no tienes conexión';
        }
    );

    this.parametros.leer('AlmacénRuta').subscribe(
        data => {
            self.usuario.almacen = data;
        },
        error => {
            console.log('No se ha podido cargar el almacén por defecto');
            this.error = '¡Ups! Parece que no tienes conexión';
        }
    );
    
    this.parametros.leer('PermitirVerTodosLosPedidos').subscribe(
        data => {
            self.usuario.permitirVerTodosLosPedidos = data == "1";
        },
        error => {
            self.usuario.permitirVerTodosLosPedidos = false;
            console.log('No se ha podido cargar el parámetro PermitirVerTodosLosPedidos');
            this.error = '¡Ups! Parece que no tienes conexión';
        }
    );

    this.parametros.leer('PermitirVerClientesTodosLosVendedores').subscribe(
        data => {
            self.usuario.permitirVerClientesTodosLosVendedores = data == "1";
        },
        error => {
            self.usuario.permitirVerClientesTodosLosVendedores = false;
            console.log('No se ha podido cargar el parámetro PermitirVerClientesTodosLosVendedores');
            this.error = '¡Ups! Parece que no tienes conexión';
        }
    );

    this.parametros.leer('PermitirVerTodosLosVendedores').subscribe(
        data => {
            self.usuario.permitirVerTodosLosVendedores = data == "1";
        },
        error => {
            self.usuario.permitirVerTodosLosVendedores = false;
            console.log('No se ha podido cargar el parámetro PermitirVerTodosLosVendedores');
            this.error = '¡Ups! Parece que no tienes conexión';
        }
    );

    this.parametros.leer('PermitirCrearPedidoConErroresValidacion').subscribe(
        data => {
            self.usuario.permitirCrearPedidoConErroresValidacion = data == "1";
        },
        error => {
            self.usuario.permitirCrearPedidoConErroresValidacion = false;
            console.log('No se ha podido cargar el parámetro PermitirCrearPedidoConErroresValidacion');
        }
    );

    this.parametros.leer('MotorPagos').subscribe(
        data => {
            self.usuario.motorPagos = data || 'Paygold';
        },
        error => {
            self.usuario.motorPagos = 'Paygold';
            console.log('No se ha podido cargar el parámetro MotorPagos');
        }
    );

    this.parametros.leer('AlmacenesPlantillaVenta').subscribe(
        data => {
            if (data) {
                self.usuario.almacenesPlantillaVenta = data;
            }
        },
        error => {
            console.log('No se ha podido cargar el parámetro AlmacenesPlantillaVenta');
        }
    );
}

public cambiarVerStockTresAlmacenes(verTres: boolean): void {
    const valorAnterior: string = this.usuario.almacenesPlantillaVenta;
    const nuevoCsv: string = verTres ? 'ALG,ALC,REI' : (this.usuario.almacen || 'ALG');
    this.usuario.almacenesPlantillaVenta = nuevoCsv;

    this.parametros.escribir('AlmacenesPlantillaVenta', nuevoCsv).subscribe(
        () => {
            // Guardado correctamente.
        },
        error => {
            // Revertir el valor si falla el guardado.
            this.usuario.almacenesPlantillaVenta = valorAnterior;
            console.log('No se ha podido guardar el parámetro AlmacenesPlantillaVenta', error);
            this.error = 'No se ha podido guardar la preferencia de stock';
        }
    );
}

    async olvideMiContrasenna(correo: string) {
        const alert = await this.alertCtrl.create({
            header: 'Contraseña',
            message: '¿Está seguro que desea cambiar su contraseña?',
            buttons: [
                {
                    text:'Sí',
                    handler: () => {
                        this.llamarApiOlvideContrasenna(correo);
                    }
                },
                {
                    text:'No',
                    role: 'cancel',
                }
            ],
        });
        await alert.present();
    }

    async llamarApiOlvideContrasenna(correo: string) {
        const loading: any = await this.loadingCtrl.create({
            message: 'Reseteando contraseña...',
        })
        
        await loading.present();

        const url_ = Configuracion.API_URL+'/Accounts/OlvideMiContrasenna';
        const params = new URLSearchParams();
        params.set('correo', correo);

        this.http.post(
            url_,
            params,
            {
                headers: this.contentHeader,
                params: {
                    correo: correo,
                }
            })
            .subscribe(
            async () => {
                const alert = await this.alertCtrl.create({
                    header: 'Contraseña',
                    subHeader: 'Le hemos enviado un correo electrónico',
                    message: 'Haga clic en el enlace del correo para cambiar la contraseña',
                    buttons: ['Ok'],
                });
                await alert.present();
                this.mostrarOlvideMiContrasenna = false;
            },
            async () => {
                await loading.dismiss();
                this.error = 'No se ha podido conectar con el servidor para recuperar la contraseña';
            },
            async () => {
                await loading.dismiss();
            }
        );
    }

    mostrarOcultarOlvideContrasenna() {
        this.mostrarOlvideMiContrasenna = !this.mostrarOlvideMiContrasenna;
        if (this.mostrarOlvideMiContrasenna) {
            setTimeout(() => {
                this.correoContrasenna.setFocus();            
            }, 200);    
        }
    }

    public textoContador(noLeidas: number | null): string {
        return textoContador(noLeidas || 0);
    }

    public abrirEnlace(urlDestino: string): void {
        urlDestino += "&utm_medium=seestavendiendo";
        this.firebaseAnalytics.logEvent("se_esta_vendiendo_abrir_enlace", {enlace: urlDestino});
        window.open(urlDestino, '_system', 'location=yes');
    }

    public abrirFichaProducto(producto: any): void {
        this.nav.navigateForward("/producto", { queryParams: { empresa: "1", producto: producto.Producto }});
    }

}
