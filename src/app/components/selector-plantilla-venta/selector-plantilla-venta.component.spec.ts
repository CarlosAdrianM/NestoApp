import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { CacheService } from 'ionic-cache';
import { Usuario } from 'src/app/models/Usuario';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics/ngx';

import { SelectorPlantillaVentaComponent } from './selector-plantilla-venta.component';

describe('SelectorPlantillaVentaComponent', () => {
  let component: SelectorPlantillaVentaComponent;
  let fixture: ComponentFixture<SelectorPlantillaVentaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectorPlantillaVentaComponent ],
      imports: [IonicModule.forRoot(), HttpClientTestingModule, RouterTestingModule],
      providers: [
        Usuario,
        { provide: CacheService, useValue: { setDefaultTTL: () => {}, loadFromObservable: (k, obs) => obs } },
        { provide: Keyboard, useValue: { show: () => {} } },
        { provide: FirebaseAnalytics, useValue: { logEvent: () => {} } }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectorPlantillaVentaComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
