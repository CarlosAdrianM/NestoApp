import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NavigationEnd, Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { firstValueFrom, of } from 'rxjs';
import { catchError, filter } from 'rxjs/operators';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';
import { Usuario } from '../models/Usuario';
import { APLICACION_GLOBOS, ESPERA_ANCLA_MS, Globo, globosParaEnsenar, pantallaDeUrl } from '../models/globo.model';
import { GloboComponent } from '../components/globo/globo.component';

/**
 * Globos («consejos») de NestoAPI#774 en NestoApp. Al entrar en una pantalla (cada navegación) pide sus globos pendientes y
 * enseña como mucho dos, de uno en uno: junto a su control (directiva `globoAncla`), esperando a que se vea, o centrados si no
 * tienen ancla. «Entendido» lo marca visto en la API (por usuario); cerrarlo tocando fuera lo deja para la próxima sesión.
 * Si falla la API (o no hay script), no sale nada y la app sigue como siempre.
 */
@Injectable({
  providedIn: 'root'
})
export class GlobosService {
  /** Las anclas que hay ahora en el DOM (una misma clave puede estar en una página cacheada y oculta). */
  private anclas = new Map<string, Set<HTMLElement>>();
  /** Enseñados en esta sesión (vistos o cerrados): no se repiten hasta reabrir la app. */
  private yaEnsenados = new Set<number>();
  /** Cambia en cada pantalla: lo que se estaba esperando en la anterior se abandona. */
  private turno = 0;
  private iniciado = false;
  /** Lo que tarda la transición de Ionic antes de buscar el control. Sustituible en los tests. */
  public esperaEntrada = 700;
  public intervaloAncla = 300;

  constructor(
    private http: HttpClient,
    private popoverCtrl: PopoverController,
    private router: Router,
    private usuario: Usuario
  ) { }

  /** Lo llama AppComponent al arrancar. */
  public iniciar(): void {
    if (this.iniciado) {
      return;
    }
    this.iniciado = true;
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: NavigationEnd) => {
      this.alEntrar(pantallaDeUrl(e.urlAfterRedirects || e.url));
    });
  }

  public registrarAncla(ancla: string, elemento: HTMLElement): void {
    const clave = (ancla || '').trim();
    if (!clave || !elemento) {
      return;
    }
    if (!this.anclas.has(clave)) {
      this.anclas.set(clave, new Set<HTMLElement>());
    }
    this.anclas.get(clave).add(elemento);
  }

  public quitarAncla(ancla: string, elemento: HTMLElement): void {
    this.anclas.get((ancla || '').trim())?.delete(elemento);
  }

  public async alEntrar(pantalla: string): Promise<void> {
    const turno = ++this.turno;
    if (!pantalla || !this.usuario?.nombre) {
      return;
    }
    await this.esperar(this.esperaEntrada);
    if (turno !== this.turno) {
      return;
    }
    const params = new HttpParams()
      .set('aplicacion', APLICACION_GLOBOS)
      .set('pantalla', pantalla)
      .set('version', Configuracion.VERSION);
    const globos = await firstValueFrom(
      this.http.get<Globo[]>(`${Configuracion.API_URL}/Globos`, { params }).pipe(catchError(() => of([] as Globo[])))
    );
    for (const globo of globosParaEnsenar(globos, this.yaEnsenados)) {
      if (turno !== this.turno) {
        return;
      }
      const conAncla = !!(globo.Ancla || '').trim();
      const elemento = conAncla ? await this.esperarAncla(globo.Ancla, turno) : null;
      if (turno !== this.turno) {
        return;
      }
      if (conAncla && !elemento) {
        continue; // su control no está a la vista: queda para otra vez
      }
      this.yaEnsenados.add(globo.Id);
      const respuesta = await this.ensenar(globo, elemento);
      if (respuesta === 'visto' || respuesta === 'novedad') {
        this.marcarVisto(globo.Id);
      }
      if (respuesta === 'novedad' && globo.NovedadId) {
        this.router.navigateByUrl(`/profile?novedad=${globo.NovedadId}&aviso=${Date.now()}`);
        return;
      }
      if (respuesta !== 'visto') {
        return; // cerrado tocando fuera: no se encadena el siguiente
      }
    }
  }

  public marcarVisto(id: number): void {
    this.http.post(`${Configuracion.API_URL}/Globos/${id}/Visto`, null).pipe(catchError(() => of(null))).subscribe();
  }

  /** El elemento visible de esa ancla (o null si en el tiempo de espera no aparece). */
  private async esperarAncla(ancla: string, turno: number): Promise<HTMLElement | null> {
    const limite = Date.now() + ESPERA_ANCLA_MS;
    for (;;) {
      const visible = this.anclaVisible(ancla);
      if (visible || turno !== this.turno || Date.now() >= limite) {
        return visible;
      }
      await this.esperar(this.intervaloAncla);
    }
  }

  /** En el DOM y a la vista (las páginas cacheadas de Ionic están ocultas: sin offsetParent). */
  public anclaVisible(ancla: string): HTMLElement | null {
    for (const elemento of Array.from(this.anclas.get((ancla || '').trim()) || [])) {
      if (elemento.isConnected && elemento.offsetParent !== null && elemento.getBoundingClientRect().width > 0) {
        return elemento;
      }
    }
    return null;
  }

  /** 'visto' (Entendido), 'novedad' (Ver la novedad) o lo que sea al cerrarlo tocando fuera. */
  private async ensenar(globo: Globo, elemento: HTMLElement | null): Promise<string | undefined> {
    elemento?.scrollIntoView?.({ block: 'center', behavior: 'auto' });
    const popover = await this.popoverCtrl.create({
      component: GloboComponent,
      componentProps: { globo },
      // Ionic coloca el popover junto a event.target; sin él, centrado.
      event: elemento ? ({ target: elemento } as any) : undefined,
      side: 'bottom',
      alignment: 'center',
      arrow: true,
      cssClass: 'globo-popover'
    });
    await popover.present();
    const { role } = await popover.onDidDismiss();
    return role;
  }

  private esperar(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
