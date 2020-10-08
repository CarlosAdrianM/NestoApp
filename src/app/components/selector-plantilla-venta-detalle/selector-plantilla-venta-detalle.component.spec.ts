import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SelectorPlantillaVentaDetalleComponent } from './selector-plantilla-venta-detalle.component';

describe('SelectorPlantillaVentaDetalleComponent', () => {
  let component: SelectorPlantillaVentaDetalleComponent;
  let fixture: ComponentFixture<SelectorPlantillaVentaDetalleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectorPlantillaVentaDetalleComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectorPlantillaVentaDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
