import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AlertController, NavController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';
import { Usuario } from '../models/Usuario';
import { Novedad } from './novedades.service';
import { FirebaseAnalytics } from './firebase-analytics.service';
import {
  AMBITOS_AVISO_NOVEDADES, CLAVE_ULTIMA_NOVEDAD_VISTA, novedadesDeLaVersionInstalada, novedadesParaAvisar, seVeEnElPerfil, siguienteUltimaNovedadVista, textoAvisoNovedades, ultimaNovedadVistaDe
} from '../models/novedades-nuevas.model';

/**
 * NestoApp#177 fase 2 (NestoAPI#495): al iniciar sesión (una vez por arranque) mira si hay novedades posteriores a la
 * última que vio el usuario y, si las hay, se las cuenta. Todo en silencio: si algo falla (sin conexión, API anterior, o
 * falta la fila «(defecto)» del parámetro y da 404) no se enseña nada ni se guarda nada. La primera vez (parámetro vacío)
 * se apunta por dónde va y solo se cuenta lo que estrena la versión instalada.
 */
@Injectable({
  providedIn: 'root'
})
export class NovedadesNuevasService {
  /** Las avisadas en este móvil mientras la última vista no puede avanzar (hay una versión de la app que aún no ha llegado). */
  static readonly CLAVE_LOCAL = 'novedadesAvisadas';
  private comprobado = false;

  constructor(
    private http: HttpClient,
    private usuario: Usuario,
    private alertCtrl: AlertController,
    private nav: NavController,
    private firebaseAnalytics: FirebaseAnalytics
  ) { }

  public async comprobar(): Promise<void> {
    if (this.comprobado || !this.usuario?.nombre) {
      return;
    }
    this.comprobado = true;
    try {
      const ultima = ultimaNovedadVistaDe(await firstValueFrom(this.leerUltimaVista()));
      const nuevas = await firstValueFrom(this.leerNuevas(ultima ?? 0));
      const siguiente = siguienteUltimaNovedadVista(nuevas, Configuracion.VERSION, ultima ?? 0);
      if (ultima === null) {
        // Primera vez: se apunta por dónde va y solo se cuenta lo que estrena la versión instalada, no todo el histórico
        const estrenadas = novedadesDeLaVersionInstalada(nuevas, Configuracion.VERSION);
        if (estrenadas.length > 0) {
          await this.avisar(estrenadas);
        }
        await this.guardarUltimaVista(siguiente);
        return;
      }
      const yaAvisadas = this.leerAvisadas().filter(id => id > siguiente);
      const paraAvisar = novedadesParaAvisar(nuevas, Configuracion.VERSION, this.leerAvisadas());
      if (paraAvisar.length > 0) {
        await this.avisar(paraAvisar);
      }
      this.guardarAvisadas([...yaAvisadas, ...paraAvisar.map(n => n.Id).filter(id => id > siguiente)]);
      if (siguiente > ultima) {
        await this.guardarUltimaVista(siguiente);
      }
    } catch (error) {
      console.log('No se han podido comprobar las novedades nuevas', error);
    }
  }

  private leerUltimaVista() {
    const params = new HttpParams()
      .set('empresa', Configuracion.EMPRESA_POR_DEFECTO)
      .set('usuario', this.usuario.nombre)
      .set('clave', CLAVE_ULTIMA_NOVEDAD_VISTA);
    return this.http.get<any>(`${Configuracion.API_URL}/ParametrosUsuario`, { params });
  }

  private leerNuevas(desdeId: number) {
    const params = new HttpParams().set('ambitos', AMBITOS_AVISO_NOVEDADES).set('desdeId', desdeId.toString());
    return this.http.get<Novedad[]>(`${Configuracion.API_URL}/Novedades`, { params });
  }

  /** El backend hace EntityState.Modified: hay que mandar la entidad completa, como Parametros.escribir. */
  private guardarUltimaVista(id: number): Promise<any> {
    return firstValueFrom(this.http.put(`${Configuracion.API_URL}/ParametrosUsuario`, {
      Empresa: Configuracion.EMPRESA_POR_DEFECTO,
      Clave: CLAVE_ULTIMA_NOVEDAD_VISTA,
      Usuario: this.usuario.nombre,
      Valor: id.toString(),
      Usuario2: this.usuario.nombre,
      'Fecha_Modificación': new Date().toISOString()
    }));
  }

  private async avisar(novedades: Novedad[]): Promise<void> {
    this.firebaseAnalytics.logEvent('novedades_aviso', { cuantas: novedades.length });
    const enPerfil = novedades.find(n => seVeEnElPerfil(n));
    const alerta = await this.alertCtrl.create({
      header: novedades.length === 1 ? 'Hay una novedad' : `Hay ${novedades.length} novedades`,
      message: textoAvisoNovedades(novedades),
      cssClass: 'alerta-preformateada',
      // Solo las de la app están en el perfil: si no hay ninguna, no hay nada más que ver
      buttons: enPerfil
        ? [
          { text: 'Ahora no', role: 'cancel' },
          { text: 'Ver novedades', handler: () => { this.nav.navigateForward('/profile', { queryParams: { novedad: enPerfil.Id, aviso: Date.now() } }); } }
        ]
        : ['Entendido']
    });
    await alerta.present();
  }

  private leerAvisadas(): number[] {
    try {
      const lista = JSON.parse(localStorage.getItem(NovedadesNuevasService.CLAVE_LOCAL) || '[]');
      return Array.isArray(lista) ? lista.map(id => +id).filter(id => id > 0) : [];
    } catch {
      return [];
    }
  }

  private guardarAvisadas(ids: number[]): void {
    try {
      localStorage.setItem(NovedadesNuevasService.CLAVE_LOCAL, JSON.stringify(Array.from(new Set(ids))));
    } catch { }
  }
}
