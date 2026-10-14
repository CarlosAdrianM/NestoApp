import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { CacheService } from '../../services/cache.service';
import { Usuario } from 'src/app/models/Usuario';
import { Keyboard } from '../../services/keyboard.service';
import { FirebaseAnalytics } from '../../services/firebase-analytics.service';

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

  describe('sustituirProducto (#220, Compras pide servir otra referencia)', () => {
    beforeEach(() => {
      component['inicializarDatos']([
        { producto: '25539', texto: 'PANTALON LOTE RT', cantidad: 100, cantidadOferta: 10, precio: 30, descuento: 0 },
        { producto: '38167', texto: 'OTRO', cantidad: 1, cantidadOferta: 0, precio: 25, descuento: 0 }
      ]);
    });

    it('si el sustituto ya está en la plantilla, le pasa las unidades y las de oferta y deja el original a cero', async () => {
      component['inicializarDatos']([
        ...component.obtenerDatosIniciales(),
        { producto: '45685', texto: 'PANTALON COD040308', cantidad: 0, cantidadOferta: 0, precio: 32, descuento: 0 }
      ]);

      expect(await component.sustituirProducto('25539', '45685')).toBeTrue();

      const datos = component.obtenerDatosIniciales();
      expect(datos.find(l => l.producto === '45685').cantidad).toBe(100);
      expect(datos.find(l => l.producto === '45685').cantidadOferta).toBe(10);
      expect(datos.find(l => l.producto === '25539').cantidad).toBe(0);
      expect(datos.find(l => l.producto === '25539').cantidadOferta).toBe(0);
    });

    it('si no está, lo busca como si lo metiera el vendedor (con su precio) y lo añade', async () => {
      spyOn(component['servicio'], 'buscarProductos').and.returnValue(of([
        { producto: '456850', texto: 'OTRA COSA', precio: 1, estado: 0 },
        { producto: '45685 ', texto: 'PANTALON COD040308', precio: 32, estado: 0, aplicarDescuento: true }
      ]));

      expect(await component.sustituirProducto('25539', '45685')).toBeTrue();

      const sustituto = component.obtenerDatosIniciales().find(l => l.producto.trim() === '45685');
      expect(sustituto.precio).toBe(32);
      expect(sustituto.cantidad).toBe(100);
      expect(sustituto.cantidadOferta).toBe(10);
      expect(sustituto.aplicarDescuentoFicha).toBeTrue();
    });

    it('si no encuentra el sustituto, no toca nada', async () => {
      spyOn(component['servicio'], 'buscarProductos').and.returnValue(of([]));

      expect(await component.sustituirProducto('25539', '45685')).toBeFalse();
      expect(component.obtenerDatosIniciales().find(l => l.producto === '25539').cantidad).toBe(100);
    });
  });

  describe('aplicarDescuento (#211, oferta escalonada)', () => {
    beforeEach(() => {
      component['inicializarDatos']([
        { producto: '40919', cantidad: 1, cantidadOferta: 0, precio: 30, descuento: 0, aplicarDescuento: false },
        { producto: '38167', cantidad: 1, cantidadOferta: 0, precio: 25, descuento: 0, aplicarDescuento: true }
      ]);
    });

    it('pone el descuento en la línea del producto, la marca para aplicar descuento y respeta las unidades', () => {
      expect(component.aplicarDescuento('40919 ', 0.2)).toBeTrue();

      const linea = component.obtenerDatosIniciales().find(l => l.producto === '40919');
      expect(linea.descuento).toBe(0.2);
      expect(linea.aplicarDescuento).toBeTrue();
      expect(linea.cantidad).toBe(1);
      expect(component.obtenerDatosIniciales().find(l => l.producto === '38167').descuento).toBe(0);
    });

    it('devuelve false si el producto no está en la plantilla', () => {
      expect(component.aplicarDescuento('99999', 0.2)).toBeFalse();
    });
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
