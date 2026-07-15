import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AlertController, Platform, ToastController } from '@ionic/angular';
import { Usuario } from './models/Usuario';
import { CacheService } from './services/cache.service';
import { ErroresService } from './services/errores.service';

import { AppComponent } from './app.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AppComponent', () => {

  let platformReadySpy;
  let platformSpy;

  beforeEach(waitForAsync(() => {
    platformReadySpy = Promise.resolve();
    platformSpy = jasmine.createSpyObj('Platform', { ready: platformReadySpy, is: false });

    TestBed.configureTestingModule({
    declarations: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [RouterTestingModule],
    providers: [
        { provide: Platform, useValue: platformSpy },
        { provide: ToastController, useValue: jasmine.createSpyObj('ToastController', ['create']) },
        { provide: AlertController, useValue: jasmine.createSpyObj('AlertController', ['create']) },
        Usuario,
        { provide: CacheService, useValue: { setDefaultTTL: () => { } } },
        { provide: ErroresService, useValue: { reportar: () => { } } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  // Tras la migración Cordova -> Capacitor, initializeApp() sólo llama a
  // StatusBar.setStyle()/SplashScreen.hide() (plugins de @capacitor/*) cuando
  // Capacitor.isNativePlatform() es true. En el entorno de test (web) es false,
  // así que esos plugins no se invocan. El comportamiento observable que sí
  // ocurre siempre es platform.ready().
  it('should initialize the app', async () => {
    TestBed.createComponent(AppComponent);
    expect(platformSpy.ready).toHaveBeenCalled();
    await platformReadySpy;
  });

  // TODO: add more tests!

});
