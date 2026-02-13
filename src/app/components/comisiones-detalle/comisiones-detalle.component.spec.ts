import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics/ngx';

import { ComisionesDetalleComponent } from './comisiones-detalle.component';

describe('ComisionesDetalleComponent', () => {
  let component: ComisionesDetalleComponent;
  let fixture: ComponentFixture<ComisionesDetalleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ComisionesDetalleComponent ],
      imports: [IonicModule.forRoot(), HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: FirebaseAnalytics, useValue: { logEvent: () => {} } }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ComisionesDetalleComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
