import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FirebaseAnalytics } from 'src/app/services/firebase-analytics.service';

import { OfertasAutorizadasComponent } from './ofertas-autorizadas.component';
import { OfertasAutorizadasService } from './ofertas-autorizadas.service';

describe('OfertasAutorizadasComponent (#137)', () => {
  let component: OfertasAutorizadasComponent;
  let fixture: ComponentFixture<OfertasAutorizadasComponent>;
  let servicio: any;
  let queryParams: any;

  const datos = () => ({
    combinadas: [{
      Id: 7, Empresa: '1', Nombre: 'Pack cabina', ImporteMinimo: 300, RegalarMenorImporte: true,
      UnidadesRegaladas: 1, Detalles: [
        { Id: 1, Producto: '38093', ProductoNombre: 'CREMA', Cantidad: 6, Precio: 10, PermitirCantidadMenor: false },
        { Id: 2, Producto: null, Familia: 'ROSETA', Cantidad: 1, Precio: 0, PermitirCantidadMenor: true }
      ]
    }],
    familias: [{
      NOrden: 3, Empresa: '1', Familia: 'CERA', FamiliaDescripcion: 'Ceras',
      CantidadConPrecio: 6, CantidadRegalo: 1, FiltroProducto: null
    }],
    escalonadas: [{
      Id: 11, Empresa: '1', Nombre: 'Volumen tinte',
      Productos: [{ Id: 1, Producto: '12345', ProductoNombre: 'TINTE', PrecioBase: 8 }],
      Tramos: [{ Id: 1, CantidadMinima: 12, Descuento: 0.25 }]
    }]
  });

  beforeEach(waitForAsync(() => {
    queryParams = {};
    servicio = { cargarTodas: jasmine.createSpy('cargarTodas').and.returnValue(of(datos())) };

    TestBed.configureTestingModule({
      declarations: [OfertasAutorizadasComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        { provide: OfertasAutorizadasService, useValue: servicio },
        { provide: ActivatedRoute, useValue: { snapshot: { get queryParams() { return queryParams; } } } },
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OfertasAutorizadasComponent);
    component = fixture.componentInstance;
  }));

  it('carga las tres modalidades al entrar', () => {
    component.ionViewWillEnter();

    expect(servicio.cargarTodas).toHaveBeenCalled();
    expect(component.combinadas.length).toBe(1);
    expect(component.familias.length).toBe(1);
    expect(component.escalonadas.length).toBe(1);
  });

  it('no vuelve a cargar si ya se había cargado', () => {
    component.ionViewWillEnter();
    component.ionViewWillEnter();

    expect(servicio.cargarTodas).toHaveBeenCalledTimes(1);
  });

  it('empieza por las combinadas si el deeplink no dice otra cosa', () => {
    component.ionViewWillEnter();

    expect(component.tipoSeleccionado).toBe('combinada');
    expect(component.ofertaAbierta).toBeNull();
  });

  // El deeplink de la push manda tipo e id para abrir la oferta que se acaba de autorizar.
  it('abre la oferta que indica el deeplink', () => {
    queryParams = { tipo: 'escalonada', id: '11' };

    component.ionViewWillEnter();

    expect(component.tipoSeleccionado).toBe('escalonada');
    expect(component.estaAbierta('escalonada', 11)).toBeTrue();
  });

  it('ignora un tipo desconocido en el deeplink', () => {
    queryParams = { tipo: 'loquesea' };

    component.ionViewWillEnter();

    expect(component.tipoSeleccionado).toBe('combinada');
  });

  it('describe con palabras las líneas de filtro (las que no llevan producto)', () => {
    const linea = { Producto: null, Familia: 'ROSETA', Grupo: 'COS', FiltroProducto: 'CERA' };

    expect(component.descripcionLinea(linea))
      .toBe('Cualquier producto de familia ROSETA, grupo COS, nombre que empiece por "CERA"');
  });

  it('marca como máximo la cantidad de las líneas opcionales', () => {
    expect(component.textoCantidad({ Cantidad: 1, Precio: 0, PermitirCantidadMenor: true }))
      .toBe('hasta 1 ud. a 0,00 €');
    expect(component.textoCantidad({ Cantidad: 6, Precio: 10, PermitirCantidadMenor: false }))
      .toBe('6 ud. a 10,00 €');
  });

  it('enseña el descuento de los tramos en porcentaje', () => {
    expect(component.porcentaje(0.25)).toBe('25 %');
    expect(component.porcentaje(0.125)).toBe('12,50 %');
  });

  it('dice que no hay fecha de fin cuando la oferta no la tiene', () => {
    expect(component.vigencia(null, null)).toBe('Sin fecha de fin');
  });

  it('no deja la pantalla cargando para siempre si la API falla', () => {
    servicio.cargarTodas.and.returnValue(throwError(() => ({ Message: 'Error' })));

    component.ionViewWillEnter();

    expect(component.cargando).toBeFalse();
    expect(component.cargaInicialHecha).toBeFalse();
  });

  it('el segmento cambia de modalidad y cierra lo que hubiera abierto', () => {
    component.ionViewWillEnter();
    component.alternarOferta('combinada', 7);

    component.cambiarTipo({ detail: { value: 'familia' } });

    expect(component.tipoSeleccionado).toBe('familia');
    expect(component.ofertaAbierta).toBeNull();
  });
});
