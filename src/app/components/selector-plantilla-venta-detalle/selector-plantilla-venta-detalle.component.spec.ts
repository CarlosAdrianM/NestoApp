import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { Keyboard } from '@awesome-cordova-plugins/keyboard/ngx';

import { SelectorPlantillaVentaDetalleComponent } from './selector-plantilla-venta-detalle.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SelectorPlantillaVentaDetalleComponent', () => {
  let component: SelectorPlantillaVentaDetalleComponent;
  let fixture: ComponentFixture<SelectorPlantillaVentaDetalleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [SelectorPlantillaVentaDetalleComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IonicModule.forRoot(), RouterTestingModule],
    providers: [
        { provide: Keyboard, useValue: { show: () => { } } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: { producto: { stockActualizado: true, cantidad: 0, cantidadOferta: 0, descuento: 0 }, cliente: {}, almacen: 'ALG' } } } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();

    fixture = TestBed.createComponent(SelectorPlantillaVentaDetalleComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
