import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { FirebaseAnalytics } from '@awesome-cordova-plugins/firebase-analytics/ngx';

import { ComisionesDetalleComponent } from './comisiones-detalle.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ComisionesDetalleComponent', () => {
  let component: ComisionesDetalleComponent;
  let fixture: ComponentFixture<ComisionesDetalleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [ComisionesDetalleComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IonicModule.forRoot(), RouterTestingModule],
    providers: [
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();

    fixture = TestBed.createComponent(ComisionesDetalleComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
