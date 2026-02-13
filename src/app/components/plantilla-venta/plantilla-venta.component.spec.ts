import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { Usuario } from 'src/app/models/Usuario';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics/ngx';
import { Storage } from '@ionic/storage';

import { PlantillaVentaComponent } from './plantilla-venta.component';

describe('PlantillaVentaComponent', () => {
  let component: PlantillaVentaComponent;
  let fixture: ComponentFixture<PlantillaVentaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlantillaVentaComponent ],
      imports: [IonicModule.forRoot(), HttpClientTestingModule, RouterTestingModule],
      providers: [
        Usuario,
        { provide: FirebaseAnalytics, useValue: { logEvent: () => {} } },
        { provide: Storage, useValue: {} }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PlantillaVentaComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
