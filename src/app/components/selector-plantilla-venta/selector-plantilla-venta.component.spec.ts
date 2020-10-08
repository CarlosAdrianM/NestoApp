import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SelectorPlantillaVentaComponent } from './selector-plantilla-venta.component';

describe('SelectorPlantillaVentaComponent', () => {
  let component: SelectorPlantillaVentaComponent;
  let fixture: ComponentFixture<SelectorPlantillaVentaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectorPlantillaVentaComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectorPlantillaVentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
