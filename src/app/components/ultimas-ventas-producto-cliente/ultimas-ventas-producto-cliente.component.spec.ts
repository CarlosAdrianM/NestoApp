import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';

import { UltimasVentasProductoClienteComponent } from './ultimas-ventas-producto-cliente.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('UltimasVentasProductoClienteComponent', () => {
  let component: UltimasVentasProductoClienteComponent;
  let fixture: ComponentFixture<UltimasVentasProductoClienteComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [UltimasVentasProductoClienteComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IonicModule.forRoot(), RouterTestingModule],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();

    fixture = TestBed.createComponent(UltimasVentasProductoClienteComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
