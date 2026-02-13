import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { Keyboard } from '@ionic-native/keyboard/ngx';

import { SelectorPlantillaVentaDetalleComponent } from './selector-plantilla-venta-detalle.component';

describe('SelectorPlantillaVentaDetalleComponent', () => {
  let component: SelectorPlantillaVentaDetalleComponent;
  let fixture: ComponentFixture<SelectorPlantillaVentaDetalleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectorPlantillaVentaDetalleComponent ],
      imports: [IonicModule.forRoot(), HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: Keyboard, useValue: { show: () => {} } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: { producto: { stockActualizado: true, cantidad: 0, cantidadOferta: 0, descuento: 0 }, cliente: {}, almacen: 'ALG' } } } }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectorPlantillaVentaDetalleComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
