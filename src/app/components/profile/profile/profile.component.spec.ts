import { ComponentFixture, TestBed, fakeAsync, flush, tick, waitForAsync } from '@angular/core/testing';
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
import { TrozosMencionPipe } from 'src/app/pipes/trozos-mencion.pipe';
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
      ])),
      // #190: sin versión = sugerencia; la API ya las manda ordenadas por votos.
      leerSugerencias: jasmine.createSpy('leerSugerencias').and.returnValue(of([
        { Id: 9, Version: null, Fecha: '2026-09-24', Categoria: 'Nuevo', Titulo: 'Filtro por ruta', Ambito: 'NestoApp', TextoOriginal: 'Filtro por ruta', Estado: 'Pendiente', TieneImagen: false }
      ])),
      buscar: jasmine.createSpy('buscar').and.returnValue(of([])),
      leerImagenNovedad: jasmine.createSpy('leerImagenNovedad').and.returnValue(of(new Blob(['x'], { type: 'image/png' })))
    };
    profileService = {
      getSeEstaVendiendo: jasmine.createSpy('getSeEstaVendiendo').and.returnValue(of([]))
    };

    TestBed.configureTestingModule({
    declarations: [ProfileComponent, TrozosMencionPipe],
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
      expect(component.hayVersionPosterior).toBeTrue(); // #190: por delante, las sugerencias
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

  // NestoApp#190 / NestoAPI#526/#527: sugerencias por delante de la versión actual y buscador.
  describe('sugerencias y buscador (#190)', () => {
    it('las sugerencias son la página por delante de la versión actual', () => {
      expect(novedadesService.leerSugerencias).toHaveBeenCalled();
      expect(component.viendoSugerencias).toBeFalse(); // se abre en la versión actual

      component.verVersionPosterior();

      expect(component.viendoSugerencias).toBeTrue();
      expect(component.grupoNovedadesActual).toBeUndefined();
      expect(component.hayVersionPosterior).toBeFalse();
      expect(component.sugerencias[0].Titulo).toBe('Filtro por ruta');

      component.verVersionAnterior();
      expect(component.grupoNovedadesActual.version).toBe('2.20.1');
    });

    it('si la API no tiene sugerencias (endpoint caído), no hay página de sugerencias', () => {
      novedadesService.leerSugerencias.and.returnValue(throwError(() => new Error('404')));

      const otro = TestBed.createComponent(ProfileComponent).componentInstance;

      expect(otro.hayVersionPosterior).toBeFalse();
    });

    it('en pantalla, la sugerencia enseña el texto del usuario y la descripción ampliada', () => {
      novedadesService.leerSugerencias.and.returnValue(of([{
        Id: 9, Version: null, Categoria: 'Nuevo', Titulo: 'Filtro por ruta', Ambito: 'NestoApp', Estado: 'Aceptada',
        TextoOriginal: 'Filtro por ruta\nen la lista de clientes, para no ir buscando', Descripcion: 'Filtro por ruta en la lista de clientes.',
        SugeridaNombre: 'Manuel', SugeridaFecha: '2026-09-24T10:00:00', TieneImagen: false
      }]));
      const otraFixture = TestBed.createComponent(ProfileComponent);
      otraFixture.componentInstance.usuario.nombre = 'carlos';
      otraFixture.componentInstance.verVersionPosterior();
      otraFixture.detectChanges();

      const texto = otraFixture.nativeElement.textContent as string;
      expect(texto).toContain('Sugerencias pendientes');
      expect(texto).toContain('para no ir buscando');
      expect(texto).toContain('Filtro por ruta en la lista de clientes.');
      expect(texto).toContain('Manuel');
      expect(texto).toContain('Aceptada');
      expect(texto).not.toContain('Selector de modo de entrega');
    });

    it('la captura de una sugerencia se baja y se pinta', async () => {
      novedadesService.leerSugerencias.and.returnValue(of([{ Id: 9, Version: null, Titulo: 'Con captura', Ambito: 'NestoApp', TieneImagen: true }]));

      const otro = TestBed.createComponent(ProfileComponent).componentInstance;
      await new Promise(r => setTimeout(r, 50)); // FileReader

      expect(novedadesService.leerImagenNovedad).toHaveBeenCalledWith(9);
      expect(otro.imagenesSugerencias[9]).toContain('data:');
    });

    it('al crear una sugerencia se recarga la lista y se salta a ella', fakeAsync(() => {
      const nueva = { Id: 10, Version: null, Titulo: 'Nueva', Ambito: 'NestoApp' };
      novedadesService.leerSugerencias.and.returnValue(of([nueva]));

      component.alCrearSugerencia(nueva as any);
      flush();

      expect(component.viendoSugerencias).toBeTrue();
      expect(component.sugerencias.map(s => s.Id)).toEqual([10]);
    }));

    it('el buscador no busca con menos de dos letras', () => {
      component.buscarNovedades('a');

      expect(novedadesService.buscar).not.toHaveBeenCalled();
      expect(component.resultadosBusqueda).toBeNull();
    });

    it('el buscador enseña los resultados, y una respuesta vieja no pisa a la nueva', () => {
      const vieja = new Subject<any[]>();
      novedadesService.buscar.and.returnValues(vieja, of([{ Id: 1, Version: '2.20.0', Titulo: 'Arranque más rápido' }]));

      component.buscarNovedades('arra');
      component.buscarNovedades('arranque');
      vieja.next([{ Id: 99, Version: '1.0', Titulo: 'Vieja' }]);

      expect(novedadesService.buscar).toHaveBeenCalledWith('arranque');
      expect(component.resultadosBusqueda.map(r => r.Id)).toEqual([1]);
    });

    it('elegir un resultado salta a su versión, lo resalta y cierra la búsqueda', fakeAsync(() => {
      component.buscarNovedades('arranque');

      component.irAResultado({ Id: 1, Version: '2.20.0', Titulo: 'Arranque más rápido' } as any);
      flush();

      expect(component.grupoNovedadesActual.version).toBe('2.20.0');
      expect(component.resultadosBusqueda).toBeNull();
      expect(component.textoBusqueda).toBe('');
    }));

    it('un resultado sin versión salta a las sugerencias; si ya está cerrada, se enseña igual', fakeAsync(() => {
      const cerrada = { Id: 50, Version: null, Titulo: 'Descartada', Ambito: 'NestoApp', Estado: 'Descartada' };

      component.irAResultado(cerrada as any);
      flush();

      expect(component.viendoSugerencias).toBeTrue();
      expect(component.sugerencias.some(s => s.Id === 50)).toBeTrue();
    }));

    it('mostrarNovedad resalta la tarjeta un rato', fakeAsync(() => {
      component.mostrarNovedad(1, '2.20.0');
      tick(200);
      expect(component.novedadResaltada).toBe(1);

      tick(5000);
      expect(component.novedadResaltada).toBeNull();
    }));

    it('al refrescar se recargan también las sugerencias y se sigue en su página', async () => {
      component.verVersionPosterior();
      novedadesService.leerSugerencias.calls.reset();

      await component.refrescar(null);

      expect(novedadesService.leerSugerencias).toHaveBeenCalledTimes(1);
      expect(component.viendoSugerencias).toBeTrue();
    });
  });

  // NestoApp#193: al tocar la push «Te han contestado en Novedades» se abre la novedad en el comentario.
  describe('abrir la novedad desde la push (#193)', () => {
    it('recarga, salta a la versión de la novedad y le marca el comentario', fakeAsync(() => {
      novedadesService.leerNovedades.calls.reset();

      component.abrirAviso(1, 77);
      flush();

      expect(novedadesService.leerNovedades).toHaveBeenCalled(); // la respuesta es nueva: cifras frescas
      expect(component.grupoNovedadesActual.version).toBe('2.20.0');
      expect(component.avisoComentario).toEqual({ novedadId: 1, comentarioId: 77 });
    }));

    it('si es una sugerencia, salta a las sugerencias', fakeAsync(() => {
      component.abrirAviso(9, 78);
      flush();

      expect(component.viendoSugerencias).toBeTrue();
      expect(component.avisoComentario).toEqual({ novedadId: 9, comentarioId: 78 });
    }));

    it('una mención al sugerir no trae comentario: solo se enseña la sugerencia', fakeAsync(() => {
      component.abrirAviso(9, null);
      flush();

      expect(component.viendoSugerencias).toBeTrue();
      expect(component.avisoComentario).toBeNull();
    }));

    it('si la novedad ya no existe, no se mueve de donde estaba', fakeAsync(() => {
      component.abrirAviso(12345, 1);
      flush();

      expect(component.grupoNovedadesActual.version).toBe('2.20.1');
      expect(component.avisoComentario).toBeNull();
    }));
  });
});
