import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SelectorDireccionesEntregaComponent } from './selector-direcciones-entrega.component';

describe('SelectorDireccionesEntregaComponent', () => {
  let component: SelectorDireccionesEntregaComponent;
  let fixture: ComponentFixture<SelectorDireccionesEntregaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectorDireccionesEntregaComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectorDireccionesEntregaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
