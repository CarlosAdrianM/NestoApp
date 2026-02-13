import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics/ngx';
import { CacheService } from 'ionic-cache';
import { Usuario } from 'src/app/models/Usuario';

import { LineaVentaComponent } from './linea-venta.component';

describe('LineaVentaComponent', () => {
  let component: LineaVentaComponent;
  let fixture: ComponentFixture<LineaVentaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LineaVentaComponent ],
      imports: [IonicModule.forRoot(), HttpClientTestingModule, RouterTestingModule],
      providers: [
        Usuario,
        { provide: CacheService, useValue: { setDefaultTTL: () => {}, loadFromObservable: (k, obs) => obs } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: { linea: { DescuentoLinea: 0, Cantidad: 0 }, cliente: '0', contacto: '0' } } } },
        { provide: FirebaseAnalytics, useValue: { logEvent: () => {} } }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(LineaVentaComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
