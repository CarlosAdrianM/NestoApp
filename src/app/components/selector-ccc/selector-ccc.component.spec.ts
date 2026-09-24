import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { of, throwError } from 'rxjs';

import { SelectorCCCComponent } from './selector-ccc.component';
import { SelectorCCCService } from './selector-ccc.service';
import { CCC } from 'src/app/models/ccc.model';

/** NestoApp#189: la cuenta del recibo bancario en la plantilla y en el pedido. */
describe('SelectorCCCComponent (#189)', () => {
  let component: SelectorCCCComponent;
  let fixture: ComponentFixture<SelectorCCCComponent>;
  let servicio: any;
  let emitidos: string[];

  const ccc = (numero: string, estado = 0): CCC => ({
    numero, pais: 'ES', entidad: '2100', oficina: '0001', bic: '', estado,
    ibanFormateado: 'ES12 2100 0001 1234 5678 432' + numero, nombreEntidad: 'CAIXABANK', descripcion: undefined
  });

  beforeEach(waitForAsync(() => {
    servicio = { getCCCs: jasmine.createSpy('getCCCs').and.returnValue(of([ccc('1'), ccc('2')])) };
    TestBed.configureTestingModule({
      declarations: [SelectorCCCComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot()],
      providers: [{ provide: SelectorCCCService, useValue: servicio }]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectorCCCComponent);
    component = fixture.componentInstance;
    emitidos = [];
    component.seleccionar.subscribe((n: string) => emitidos.push(n));
    component.empresa = '1';
    component.cliente = '12345';
    component.contacto = '0';
  }));

  const cargar = () => {
    component.ngOnChanges({ cliente: new SimpleChange(undefined, '12345', true) });
    tick();
  };

  it('pide las cuentas del cliente y contacto del pedido', fakeAsync(() => {
    cargar();
    expect(servicio.getCCCs).toHaveBeenCalledWith('1', '12345', '0');
  }));

  it('con la cuenta de la dirección válida, no la cambia', fakeAsync(() => {
    component.seleccionado = '2';
    cargar();

    expect(emitidos).toEqual([]);
    expect(component.cccsValidos.length).toBe(2);
    expect(component.sinCCCValido).toBeFalse();
  }));

  it('si la dirección no tiene cuenta válida, propone la primera válida', fakeAsync(() => {
    servicio.getCCCs.and.returnValue(of([ccc('1', -1), ccc('2')]));
    component.seleccionado = '1';
    cargar();

    expect(emitidos).toEqual(['2']);
  }));

  it('sin ninguna cuenta válida avisa de que el recibo no irá al banco', fakeAsync(() => {
    servicio.getCCCs.and.returnValue(of([ccc('1', -1)]));
    cargar();
    fixture.detectChanges();

    expect(component.sinCCCValido).toBeTrue();
    expect(emitidos).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('el recibo NO se podrá mandar al banco');
  }));

  it('si no se pueden leer las cuentas no dice que no tiene ninguna', fakeAsync(() => {
    servicio.getCCCs.and.returnValue(throwError(() => ({ status: 500 })));
    cargar();
    fixture.detectChanges();

    expect(component.sinCCCValido).toBeFalse();
    expect(component.errorCarga).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('No se ha podido comprobar');
  }));

  it('elegir otra cuenta la emite', fakeAsync(() => {
    cargar();
    component.seleccionarCCC('2');
    expect(emitidos).toContain('2');
  }));

  // NestoAPI 69102110: validoParaRecibo / motivoNoValido / esDeLaFicha
  it('sin ninguna válida, explica por qué no vale cada cuenta (el motivo de la API)', fakeAsync(() => {
    servicio.getCCCs.and.returnValue(of([{ ...ccc('1'), validoParaRecibo: false, motivoNoValido: 'El IBAN está incompleto' }]));
    cargar();
    fixture.detectChanges();

    expect(component.sinCCCValido).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('El IBAN está incompleto');
  }));

  it('si la cuenta de la dirección no vale y se cambia por otra, se dice por qué', fakeAsync(() => {
    servicio.getCCCs.and.returnValue(of([
      { ...ccc('1'), validoParaRecibo: false, motivoNoValido: 'La cuenta está de baja' },
      { ...ccc('2'), validoParaRecibo: true, esDeLaFicha: true }
    ]));
    component.seleccionado = '1';
    cargar();
    fixture.detectChanges();

    expect(emitidos).toEqual(['2']);
    expect(component.cuentaDescartada?.numero).toBe('1');
    expect(fixture.nativeElement.textContent).toContain('La cuenta está de baja');
  }));
});
