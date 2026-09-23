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
import { of, throwError } from 'rxjs';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let novedadesService: any;

  beforeEach(waitForAsync(() => {
    novedadesService = {
      leerNovedades: jasmine.createSpy('leerNovedades').and.returnValue(of([
        { Id: 2, Version: '2.20.1', Fecha: '2026-09-16', Categoria: 'Nuevo', Titulo: 'Selector de modo de entrega', Descripcion: '', Ambito: 'NestoApp' },
        { Id: 1, Version: '2.20.0', Fecha: '2026-09-09', Categoria: 'Mejorado', Titulo: 'Arranque más rápido', Descripcion: '', Ambito: 'NestoApp' }
      ]))
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
});
