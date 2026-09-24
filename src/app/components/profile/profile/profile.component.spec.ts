import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastController } from '@ionic/angular';
import { Usuario } from 'src/app/models/Usuario';
import { Storage } from '@ionic/storage-angular';
import { FirebaseAnalytics } from 'src/app/services/firebase-analytics.service';
import { AppVersion } from 'src/app/services/app-version.service';
import { AppComponent } from 'src/app/app.component';

import { ProfileComponent } from './profile.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NovedadesService } from 'src/app/services/novedades.service';
import { ProfileService } from './profile.service';
import { Subject, of, throwError } from 'rxjs';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let novedadesService: any;
  let profileService: any;

  beforeEach(waitForAsync(() => {
    novedadesService = {
      leerNovedades: jasmine.createSpy('leerNovedades').and.returnValue(of([
        { Id: 2, Version: '2.20.1', Fecha: '2026-09-16', Categoria: 'Nuevo', Titulo: 'Selector de modo de entrega', Descripcion: '', Ambito: 'NestoApp' },
        { Id: 1, Version: '2.20.0', Fecha: '2026-09-09', Categoria: 'Mejorado', Titulo: 'Arranque más rápido', Descripcion: '', Ambito: 'NestoApp' }
      ]))
    };
    profileService = {
      getSeEstaVendiendo: jasmine.createSpy('getSeEstaVendiendo').and.returnValue(of([]))
    };

    TestBed.configureTestingModule({
    declarations: [ProfileComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IonicModule.forRoot(), RouterTestingModule, FormsModule],
    providers: [
        Usuario,
        { provide: Storage, useValue: { get: () => Promise.resolve(null) } },
        { provide: FirebaseAnalytics, useValue: { setUserId: () => { }, logEvent: () => { } } },
        { provide: AppVersion, useValue: { getVersionNumber: () => Promise.resolve('0.0.0') } },
        { provide: ToastController, useValue: {} },
        { provide: AppComponent, useValue: { registrarDispositivoPush: () => { } } },
        { provide: NovedadesService, useValue: novedadesService },
        { provide: ProfileService, useValue: profileService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // NestoApp#177: las novedades salen de la tabla Novedades de la API, agrupadas por versión.
  describe('novedades desde la API (#177)', () => {
    it('carga y agrupa las novedades al construirse', () => {
      expect(novedadesService.leerNovedades).toHaveBeenCalled();
      expect(component.gruposNovedades.length).toBe(2);
      expect(component.gruposNovedades[0].version).toBe('2.20.1');
      expect(component.gruposNovedades[0].novedades[0].Titulo).toBe('Selector de modo de entrega');
    });

    it('#188: se ve una sola versión, la más reciente, y se navega a las anteriores con flechas', () => {
      expect(component.grupoNovedadesActual.version).toBe('2.20.1');
      expect(component.hayVersionPosterior).toBeFalse();
      expect(component.hayVersionAnterior).toBeTrue();

      component.verVersionAnterior();
      expect(component.grupoNovedadesActual.version).toBe('2.20.0');
      expect(component.hayVersionAnterior).toBeFalse();
      expect(component.hayVersionPosterior).toBeTrue();

      component.verVersionAnterior(); // ya no hay más: se queda
      expect(component.grupoNovedadesActual.version).toBe('2.20.0');

      component.verVersionPosterior();
      expect(component.grupoNovedadesActual.version).toBe('2.20.1');
    });

    it('#188: en pantalla solo salen las novedades de la versión elegida', () => {
      component.usuario.nombre = 'carlos'; // la sección solo se pinta con sesión iniciada
      fixture.detectChanges();
      const texto = () => fixture.nativeElement.textContent as string;
      expect(texto()).toContain('Selector de modo de entrega');
      expect(texto()).not.toContain('Arranque más rápido');

      component.verVersionAnterior();
      fixture.detectChanges();
      expect(texto()).toContain('Arranque más rápido');
      expect(texto()).not.toContain('Selector de modo de entrega');
    });

    it('si el endpoint falla, la lista queda vacía y la sección no se pinta', () => {
      novedadesService.leerNovedades.and.returnValue(throwError(() => new Error('sin conexión')));

      const otraFixture = TestBed.createComponent(ProfileComponent);

      expect(otraFixture.componentInstance.gruposNovedades).toEqual([]);
    });
  });

  // NestoApp#192: las novedades se cargaban solo en el constructor y los votos se quedaban viejos.
  describe('refresco de las novedades (#192)', () => {
    const novedadesNuevas = [
      { Id: 3, Version: '2.20.7', Fecha: '2026-09-23', Categoria: 'Nuevo', Titulo: 'Novedades en tarjetas', Descripcion: '', Ambito: 'NestoApp' },
      { Id: 2, Version: '2.20.1', Fecha: '2026-09-16', Categoria: 'Nuevo', Titulo: 'Selector de modo de entrega', Descripcion: '', Ambito: 'NestoApp', VotosPositivos: 5 },
      { Id: 1, Version: '2.20.0', Fecha: '2026-09-09', Categoria: 'Mejorado', Titulo: 'Arranque más rápido', Descripcion: '', Ambito: 'NestoApp' }
    ];

    afterEach(() => jasmine.clock().uninstall());

    it('arrastrar hacia abajo recarga las novedades y «Se está vendiendo», y cierra el refresher al acabar las dos', async () => {
      const vendiendo = new Subject<any[]>();
      profileService.getSeEstaVendiendo.and.returnValue(vendiendo);
      novedadesService.leerNovedades.calls.reset();
      novedadesService.leerNovedades.and.returnValue(of(novedadesNuevas));
      const evento = { target: { complete: jasmine.createSpy('complete') } };

      const refresco = component.refrescar(evento);

      expect(novedadesService.leerNovedades).toHaveBeenCalledTimes(1);
      expect(component.gruposNovedades[0].version).toBe('2.20.7');
      expect(evento.target.complete).not.toHaveBeenCalled(); // falta «Se está vendiendo»

      vendiendo.next([{ Producto: '12345' }]);
      vendiendo.complete();
      await refresco;
      expect(component.listaSeEstaVendiendo.length).toBe(1);
      expect(evento.target.complete).toHaveBeenCalledTimes(1);
    });

    it('el refresher se cierra aunque falle alguna de las dos cargas', async () => {
      profileService.getSeEstaVendiendo.and.returnValue(throwError(() => new Error('sin conexión')));
      novedadesService.leerNovedades.and.returnValue(throwError(() => new Error('sin conexión')));
      const evento = { target: { complete: jasmine.createSpy('complete') } };

      await component.refrescar(evento);

      expect(evento.target.complete).toHaveBeenCalledTimes(1);
    });

    it('si el refresco falla se quedan las novedades que ya había', async () => {
      novedadesService.leerNovedades.and.returnValue(throwError(() => new Error('sin conexión')));

      await component.refrescar(null);

      expect(component.gruposNovedades.length).toBe(2);
    });

    it('al refrescar se sigue viendo la misma versión (aunque haya entrado una nueva)', async () => {
      component.verVersionAnterior(); // 2.20.0
      novedadesService.leerNovedades.and.returnValue(of(novedadesNuevas));

      await component.refrescar(null);

      expect(component.grupoNovedadesActual.version).toBe('2.20.0');
    });

    it('si la versión que se veía ya no está, vuelve a la más reciente', async () => {
      component.verVersionAnterior(); // 2.20.0
      novedadesService.leerNovedades.and.returnValue(of(novedadesNuevas.slice(0, 2)));

      await component.refrescar(null);

      expect(component.grupoNovedadesActual.version).toBe('2.20.7');
    });

    it('al volver a la pantalla recarga las novedades, pero no más de una vez por minuto', () => {
      jasmine.clock().install();
      const inicio = new Date(2026, 8, 24, 10, 0, 0);
      jasmine.clock().mockDate(inicio);
      const otraFixture = TestBed.createComponent(ProfileComponent); // carga en el constructor
      novedadesService.leerNovedades.calls.reset();

      jasmine.clock().tick(30 * 1000);
      otraFixture.componentInstance.ionViewWillEnter();
      expect(novedadesService.leerNovedades).not.toHaveBeenCalled();

      jasmine.clock().tick(31 * 1000);
      otraFixture.componentInstance.ionViewWillEnter();
      expect(novedadesService.leerNovedades).toHaveBeenCalledTimes(1);

      otraFixture.componentInstance.ionViewWillEnter(); // recién recargadas
      expect(novedadesService.leerNovedades).toHaveBeenCalledTimes(1);
    });

    it('las tarjetas se identifican por Id: refrescar no cierra los comentarios abiertos', () => {
      expect(component.idNovedad(0, novedadesNuevas[1] as any)).toBe(2);
    });
  });
});
