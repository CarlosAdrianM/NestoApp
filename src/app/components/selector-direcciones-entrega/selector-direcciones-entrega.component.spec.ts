import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { SelectorDireccionesEntregaComponent } from './selector-direcciones-entrega.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SelectorDireccionesEntregaComponent', () => {
  let component: SelectorDireccionesEntregaComponent;
  let fixture: ComponentFixture<SelectorDireccionesEntregaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [SelectorDireccionesEntregaComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IonicModule.forRoot()],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();

    fixture = TestBed.createComponent(SelectorDireccionesEntregaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
