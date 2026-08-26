import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { CacheService } from '../../services/cache.service';
import { Usuario } from 'src/app/models/Usuario';
import { Keyboard } from '@awesome-cordova-plugins/keyboard/ngx';
import { FirebaseAnalytics } from '@awesome-cordova-plugins/firebase-analytics/ngx';

import { SelectorPlantillaVentaComponent } from './selector-plantilla-venta.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { of } from 'rxjs';

describe('SelectorPlantillaVentaComponent', () => {
  let component: SelectorPlantillaVentaComponent;
  let fixture: ComponentFixture<SelectorPlantillaVentaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [SelectorPlantillaVentaComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IonicModule.forRoot(), RouterTestingModule],
    providers: [
        Usuario,
        { provide: CacheService, useValue: { setDefaultTTL: () => { }, loadFromObservable: (k, obs) => obs } },
        { provide: Keyboard, useValue: { show: () => { } } },
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();

    fixture = TestBed.createComponent(SelectorPlantillaVentaComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('cambiar el almacén a mitad de pedido (issue #166)', () => {
    beforeEach(() => {
      // Toast sin DOM real
      spyOn(component['toastCtrl'], 'create').and.returnValue(
        Promise.resolve({ present: () => Promise.resolve() } as any)
      );
      // Precargamos una línea con cantidad ya introducida
      component['inicializarDatos']([
        { producto: '111', cantidad: 5, cantidadOferta: 0, cantidadDisponible: 10, stockActualizado: true, precio: 1, descuento: 0 }
      ]);
      component.almacen = 'ALC';
    });

    it('re-estampa stocks sin recargar la plantilla ni perder las cantidades', () => {
      const ponerStocksSpy = spyOn(component['servicio'], 'ponerStocks').and.returnValue(
        of([{ producto: '111', cantidad: 5, cantidadOferta: 0, cantidadDisponible: 2, stockActualizado: true, stocks: [], colorStock: 'danger' }])
      );
      const cargarDatosSpy = spyOn(component, 'cargarDatos');

      component.ngOnChanges({ almacen: { firstChange: false, currentValue: 'ALC', previousValue: 'ALG', isFirstChange: () => false } });

      expect(ponerStocksSpy).toHaveBeenCalled();
      expect(cargarDatosSpy).not.toHaveBeenCalled();
      const linea = component.datosFiltrados[0];
      expect(linea.cantidad).toBe(5);            // se conserva la cantidad
      expect(linea.cantidadDisponible).toBe(2);  // se actualiza el stock del nuevo almacén
    });

    it('en la carga inicial (firstChange) recarga la plantilla con normalidad', () => {
      const ponerStocksSpy = spyOn(component['servicio'], 'ponerStocks');
      const cargarDatosSpy = spyOn(component, 'cargarDatos');

      component.ngOnChanges({
        cliente: { firstChange: true, currentValue: '1', previousValue: undefined, isFirstChange: () => true },
        almacen: { firstChange: true, currentValue: 'ALC', previousValue: undefined, isFirstChange: () => true }
      });

      expect(cargarDatosSpy).toHaveBeenCalled();
      expect(ponerStocksSpy).not.toHaveBeenCalled();
    });

    it('avisa con un toast del recuento de líneas sin stock en el nuevo almacén', () => {
      spyOn(component['servicio'], 'ponerStocks').and.returnValue(
        of([{ producto: '111', cantidad: 5, cantidadOferta: 0, cantidadDisponible: 2, stockActualizado: true, stocks: [] }])
      );
      spyOn(component, 'cargarDatos');

      component.ngOnChanges({ almacen: { firstChange: false, currentValue: 'ALC', previousValue: 'ALG', isFirstChange: () => false } });

      expect(component['toastCtrl'].create).toHaveBeenCalledWith(jasmine.objectContaining({ color: 'warning' }));
    });
  });
});
