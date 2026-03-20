import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { CacheService } from '../../services/cache.service';
import { Usuario } from 'src/app/models/Usuario';
import { Keyboard } from '@awesome-cordova-plugins/keyboard/ngx';
import { FirebaseAnalytics } from '@awesome-cordova-plugins/firebase-analytics/ngx';

import { SelectorPlantillaVentaComponent } from './selector-plantilla-venta.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SelectorPlantillaVentaComponent', () => {
  let component: SelectorPlantillaVentaComponent;
  let fixture: ComponentFixture<SelectorPlantillaVentaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [SelectorPlantillaVentaComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IonicModule.forRoot(), RouterTestingModule],
    providers: [
        Usuario,
        { provide: CacheService, useValue: { setDefaultTTL: () => { }, loadFromObservable: (k, obs) => obs } },
        { provide: Keyboard, useValue: { show: () => { } } },
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();

    fixture = TestBed.createComponent(SelectorPlantillaVentaComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
