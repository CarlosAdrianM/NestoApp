import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { UltimasVentasProductoClienteComponent } from './ultimas-ventas-producto-cliente.component';

describe('UltimasVentasProductoClienteComponent', () => {
  let component: UltimasVentasProductoClienteComponent;
  let fixture: ComponentFixture<UltimasVentasProductoClienteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UltimasVentasProductoClienteComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(UltimasVentasProductoClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
