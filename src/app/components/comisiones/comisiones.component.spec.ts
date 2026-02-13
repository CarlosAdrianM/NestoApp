import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { ComisionesComponent } from './comisiones.component';
import { ComisionesService } from './comisiones.service';
import { Usuario } from 'src/app/models/Usuario';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics/ngx';
import { of, throwError } from 'rxjs';
import { ResumenComisionesMes, IEtiquetaComisionAcumulada, IEtiquetaComisionVenta } from './comisiones.interfaces';

describe('ComisionesComponent', () => {
  let component: ComisionesComponent;
  let fixture: ComponentFixture<ComisionesComponent>;
  let serviceSpy: jasmine.SpyObj<ComisionesService>;
  let usuarioMock: jasmine.SpyObj<Usuario>;
  let firebaseAnalyticsSpy: jasmine.SpyObj<FirebaseAnalytics>;

  const mockResumen: ResumenComisionesMes = {
    Vendedor: 'TEST',
    Anno: 2025,
    Mes: 9,
    Etiquetas: [
      {
        Nombre: 'General',
        Comision: 381.08,
        Tipo: 0.0275,
        Venta: 12366.32,
        EsComisionAcumulada: true,
        VentaAcumulada: 94376.50,
        ComisionAcumulada: 2595.35,
        TipoConseguido: 0.023,
        TipoReal: 0.0275,
        Proyeccion: 128040.85,
        InicioTramo: 127250.01,
        FinalTramo: 144520.74,
        BajaSaltoMesSiguiente: true,
        FaltaParaSalto: 0,
        ComisionRecuperadaEsteMes: -41.01,
        TextoSobrepago: 'Al cambiar a un tramo superior se han incrementado 41,01 € de comisión',
        TieneEstrategiaEspecial: false,
        EsSobrepago: false
      } as IEtiquetaComisionAcumulada,  // CAMBIO AQUÍ: era "as any", ahora es el tipo correcto
      {
        Nombre: 'Unión Láser',
        Comision: 114.32,
        Tipo: 0.1140,
        Venta: 1002.78
      } as IEtiquetaComisionVenta  // CAMBIO AQUÍ: añadir el tipo correcto
    ],
    TotalComisiones: 650.47,
    TotalVentaAcumulada: 134898.60,
    TotalComisionAcumulada: 7215.19,
    TotalTipoAcumulado: 0.0535
  };

  beforeEach(waitForAsync(() => {
    const serviceSpyObj = jasmine.createSpyObj('ComisionesService', ['cargarResumen']);
    const usuarioSpyObj = jasmine.createSpyObj('Usuario', [], { vendedor: 'TEST' });
    const firebaseSpyObj = jasmine.createSpyObj('FirebaseAnalytics', ['logEvent']);

    TestBed.configureTestingModule({
      declarations: [ ComisionesComponent ],
      imports: [ IonicModule.forRoot(), HttpClientTestingModule, RouterTestingModule ],
      providers: [
        { provide: ComisionesService, useValue: serviceSpyObj },
        { provide: Usuario, useValue: usuarioSpyObj },
        { provide: FirebaseAnalytics, useValue: firebaseSpyObj }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    serviceSpy = TestBed.inject(ComisionesService) as jasmine.SpyObj<ComisionesService>;
    usuarioMock = TestBed.inject(Usuario) as jasmine.SpyObj<Usuario>;
    firebaseAnalyticsSpy = TestBed.inject(FirebaseAnalytics) as jasmine.SpyObj<FirebaseAnalytics>;
    
    fixture = TestBed.createComponent(ComisionesComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with user vendor', () => {
    expect(component.vendedorSeleccionado).toBe('TEST');
  });

  it('should load summary successfully', async () => {
    serviceSpy.cargarResumen.and.returnValue(of(mockResumen));

    component.vendedorSeleccionado = 'TEST';
    await component.cargarResumen();

    expect(serviceSpy.cargarResumen).toHaveBeenCalledWith(
      'TEST',
      jasmine.any(Number),
      jasmine.any(Number),
      true,
      false
    );
    expect(component.resumen).toEqual(mockResumen);
    expect(firebaseAnalyticsSpy.logEvent).toHaveBeenCalled();
  });

  it('should not load summary if no vendor selected', async () => {
    component.vendedorSeleccionado = '';
    await component.cargarResumen();
    
    expect(serviceSpy.cargarResumen).not.toHaveBeenCalled();
  });

  it('should handle error when loading summary', async () => {
    serviceSpy.cargarResumen.and.returnValue(throwError({ error: 'Error de prueba' }));

    component.vendedorSeleccionado = 'TEST';
    await component.cargarResumen();

    expect(serviceSpy.cargarResumen).toHaveBeenCalled();
    // El componente debería mostrar un alert de error
  });

  it('should return correct color for range', () => {
    expect(component.colorRango(true)).toBe('danger');
    expect(component.colorRango(false)).toBe('success');
  });

  it('should select month correctly', () => {
    const initialMonth = component['mesSeleccionado'];
    // Este test se puede expandir cuando implementemos la funcionalidad del selector de mes
    expect(initialMonth).toBeDefined();
  });
});