import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { FirebaseAnalytics } from '../../services/firebase-analytics.service';
import { CacheService } from '../../services/cache.service';
import { Usuario } from 'src/app/models/Usuario';

import { ProductoComponent } from './producto.component';
import { ProductoService } from './producto.service';
import { of, throwError } from 'rxjs';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ProductoComponent', () => {
  let component: ProductoComponent;
  let fixture: ComponentFixture<ProductoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [ProductoComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IonicModule.forRoot(), RouterTestingModule],
    providers: [
        Usuario,
        { provide: CacheService, useValue: { setDefaultTTL: () => { }, loadFromObservable: (k, obs) => obs } },
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();

    fixture = TestBed.createComponent(ProductoComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('NestoApp#283: próxima entrada', () => {
    let servicio: ProductoService;
    beforeEach(() => { servicio = TestBed.inject(ProductoService); });

    it('pinta el texto que da la API', () => {
      spyOn(servicio, 'cargarProximaEntrada').and.returnValue(of('Pedido 220856: 27/11 (fecha aproximada)'));
      component.productoActual = '45929';
      component.cargarProximaEntrada();
      expect(servicio.cargarProximaEntrada).toHaveBeenCalledWith('45929');
      expect(component.proximaEntrada).toBe('Pedido 220856: 27/11 (fecha aproximada)');
    });

    it('si la llamada falla no se muestra nada', () => {
      spyOn(servicio, 'cargarProximaEntrada').and.returnValue(throwError(() => new Error('500')));
      component.proximaEntrada = 'la del producto anterior';
      component.cargarProximaEntrada();
      expect(component.proximaEntrada).toBe('');
    });

    it('descarta la respuesta de un producto que ya no es el de la pantalla', () => {
      spyOn(servicio, 'cargarProximaEntrada').and.callFake(() => {
        component.productoActual = '11111';
        return of('texto del 45929');
      });
      component.productoActual = '45929';
      component.cargarProximaEntrada();
      expect(component.proximaEntrada).toBe('');
    });
  });
});
