
import { TestBed, ComponentFixture, async, fakeAsync, tick } from '@angular/core/testing';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { IonicModule, NavController, Slides } from 'ionic-angular';
import { MyApp } from '../../app/app.component';
import { ClienteComponent } from './Cliente.component';
import { ClienteService } from './Cliente.service';
import { of } from 'rxjs/observable/of';
import { By } from '@angular/platform-browser';
import { doesNotThrow } from 'assert';


let comp: ClienteComponent;
let fixture: ComponentFixture<ClienteComponent>;
let service: ClienteService;
let de: DebugElement;
let el: HTMLElement;

describe('Page: Cliente', () => {

    beforeEach(async(() => {

        TestBed.configureTestingModule({

            declarations: [MyApp, ClienteComponent],

            providers: [
                NavController, ClienteService
            ],

            imports: [
                IonicModule.forRoot(MyApp)
            ],
            schemas: [ NO_ERRORS_SCHEMA ]

        }).compileComponents();

    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ClienteComponent);
        comp    = fixture.componentInstance;
        service = fixture.debugElement.injector.get(ClienteService);
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
        comp = null;
        de = null;
        el = null;
    });

    
    it('is created', () => {

        expect(fixture).toBeTruthy();
        expect(comp).toBeTruthy();

    });
    
    it('si el nif no es valido no permite pasar de slide', fakeAsync (() => {
        var respuesta: any =  {
            nifValidado: false
        };
        spyOn(service, 'validarNif').and.returnValue(of(respuesta));
        comp.goToDatosGenerales();
        expect(comp.slideActual).toBe(comp.DATOS_FISCALES);
    }));

    it('si el nif sí es valido sí permite pasar de slide', () => {
        var respuesta: any =  {
            nifValidado: true
        };
        spyOn(service, 'validarNif').and.returnValue(of(respuesta));
        comp.goToDatosGenerales();
        expect(comp.slideActual).toBe(comp.DATOS_GENERALES);
    });

    it('si el cliente existe muestra el aviso de dirección de entrega', fakeAsync(() => {
        var respuesta: any =  {
            nifValidado: true,
            existeElCliente: true,
            empresaClienteExistente:'2',
            numeroClienteExistente: '12345',
            nombre: 'NOMBRE CLIENTE EXISTENTE',
            direccion: 'DIRECCIÓN CLIENTE EXISTENTE',
            codigoPostal: '28000',
            poblacion: 'POBLACIÓN CLIENTE EXISTENTE',
            provincia: 'PROVINCIA CLIENTE EXISTENTE',
            telefono: 'TELÉFONO CLIENTE EXISTEN'
        };
        // hay que contemplar la opción de copiar el cliente a otra empresa
        // el cliente puede existir en varias empresas y lo queremos crear en otra

        spyOn(service, 'validarNif').and.returnValue(of(respuesta));
        comp.goToDatosGenerales();
        expect(comp.slideActual).toBe(comp.DATOS_GENERALES);
        expect(service.validarNif).toHaveBeenCalled();
        fixture.detectChanges();
        let tarjeta = fixture.nativeElement.querySelectorAll('.card-title')[0];
        expect(tarjeta.textContent.trim()).toBe('Creando Contacto (ya existe el cliente)');
    }));

    it('si el cliente no existe no muestra el aviso de dirección de entrega', fakeAsync(() => {
        var respuesta: any =  {
            nifValidado: true,
            existeElCliente: false
        };
        
        spyOn(service, 'validarNif').and.returnValue(of(respuesta));
        comp.goToDatosGenerales();
        expect(comp.slideActual).toBe(comp.DATOS_GENERALES);
        expect(service.validarNif).toHaveBeenCalled();
        fixture.detectChanges();
        let tarjeta = fixture.nativeElement.querySelectorAll('.card-title')[0];
        expect(tarjeta).toBeUndefined();
    }));

    it('should be un boton de siguiente y otro de anterior en datos generales', () => {
        var respuesta: any =  {
            nifValidado: true,
            existeElCliente: false
        };
        
        spyOn(service, 'validarNif').and.returnValue(of(respuesta));
        comp.goToDatosGenerales();
        fixture.detectChanges();
        let botones = fixture.nativeElement.querySelectorAll('.button');
        expect(botones[0].textContent).toBe('< Volver a Datos Fiscales');
        expect(botones[1].textContent).toBe('Ir a Datos de Comisiones >');
    })

    it('should pasar a datos comisiones al hacer clic en el boton', ()=>{
        var respuestaFiscal: any =  {
            nifValidado: true,
            existeElCliente: false
        };        
        spyOn(service, 'validarNif').and.returnValue(of(respuestaFiscal));

        var respuestaGenerales: any =  {
            hayErrores: false
        };        
        spyOn(service, 'validarDatosGenerales').and.returnValue(of(respuestaGenerales));

        comp.goToDatosGenerales();
        fixture.detectChanges();
        let botonEl = fixture.debugElement.queryAll(By.css('.button'))[1];
        botonEl.triggerEventHandler('click', null);
        expect(comp.slideActual).toBe(comp.DATOS_COMISIONES);
    })

    it('no debe pasar a datos comisiones si hay errores al validar datos generales', ()=>{
        var respuestaFiscal: any =  {
            nifValidado: true,
            existeElCliente: false
        };        
        spyOn(service, 'validarNif').and.returnValue(of(respuestaFiscal));

        var respuestaGenerales: any =  {
            hayErrores: true
        };        
        spyOn(service, 'validarDatosGenerales').and.returnValue(of(respuestaGenerales));

        comp.goToDatosGenerales();
        fixture.detectChanges();
        let botonEl = fixture.debugElement.queryAll(By.css('.button'))[1];
        botonEl.triggerEventHandler('click', null);
        expect(comp.slideActual).toBe(comp.DATOS_GENERALES);
    })

    it('los datos del cliente se actualizan con la validación de datos generales', ()=>{
        comp.cliente.codigoPostal = '28110';
        var respuestaGenerales: any =  {
            nombre: 'CARLOS',
            direccion: 'RUE DEL PERCEBE, 13',
            poblacion: 'PARIS',
            provincia: 'MADRID',
            telefono: '612345678',
            vendedorEstetica: 'NV',
            vendedorPeluqueria: 'NV',
            hayErrores: false
        };        
        spyOn(service, 'validarDatosGenerales').and.returnValue(of(respuestaGenerales));
    
        comp.goToDatosComisiones();
        expect(comp.slideActual).toBe(comp.DATOS_COMISIONES);
        fixture.detectChanges();
        let ps = fixture.nativeElement.querySelectorAll('p');
        expect(ps[0].textContent).toBe('CARLOS');
        expect(ps[1].textContent).toBe('RUE DEL PERCEBE, 13');
        expect(ps[2].textContent).toBe('28110 PARIS (MADRID)');
        expect(ps[4].textContent).toBe('612345678');
    })

    it('should be un boton de siguiente y otro de anterior en datos comisiones', () => {
        comp.cliente.codigoPostal = '28110';
        var respuestaGenerales: any =  {
            hayErrores: false
        };
        spyOn(service, 'validarDatosGenerales').and.returnValue(of(respuestaGenerales));    
        comp.goToDatosComisiones();
        fixture.detectChanges();
        let botones = fixture.nativeElement.querySelectorAll('.button');
        expect(botones[0].textContent).toBe('< Volver a Datos Generales');
        expect(botones[1].textContent).toBe('Ir a Datos de Pago >');
    })

    it('should be un input para el IBAN en datos comisiones', fakeAsync (() => {
        comp.goToDatosPago();
        fixture.detectChanges();
        let inputEl = fixture.nativeElement.querySelectorAll('ion-input')[0];
        expect(inputEl).toBeUndefined();
        comp.cliente.formaPago = "RCB";
        fixture.detectChanges();
        inputEl = fixture.nativeElement.querySelectorAll('ion-input')[0];
        expect(inputEl).toBeDefined();
        tick();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            let elementWithFocus = document.activeElement;
            expect(elementWithFocus).toEqual(inputEl);                
        });
    }))

    it('si el IBAN es incorrecto no se puede avanzar', fakeAsync (() => {
        comp.goToDatosPago();
        fixture.detectChanges();
        let inputEl = fixture.debugElement.query(By.css('ion-input'));
        expect(inputEl).toBeNull();
        comp.cliente.formaPago = "RCB";
        fixture.detectChanges();
        inputEl = fixture.debugElement.query(By.css('ion-input'));
        expect(inputEl).toBeDefined();

        tick();
        inputEl.nativeElement.value = 'ES12 1212 1212 1212 1212 1212';
        inputEl.triggerEventHandler('input', null);
        inputEl.nativeElement.dispatchEvent(new Event('input'));
        tick();
        fixture.detectChanges();
        //expect(comp.cliente.iban).toBe("ES12 1212 1212 1212 1212 1212");
        
        
        
        var respuestaPago = {
            ibanValido: false,
            ibanFormateado: "ES1234567890123456789012"
        }
        spyOn(service, "validarDatosPago" ).and.returnValue(of(respuestaPago));
        let botonSiguiente = fixture.nativeElement.querySelectorAll('button')[3];
        expect(botonSiguiente.textContent).toBe('Ir a Datos de Contacto >');
        botonSiguiente.dispatchEvent(new Event('click'));
        tick();
        fixture.detectChanges();
        //expect(service.validarDatosPago).toHaveBeenCalled();
        expect(comp.slideActual).toBe(comp.DATOS_PAGO);
        
    }))
});
