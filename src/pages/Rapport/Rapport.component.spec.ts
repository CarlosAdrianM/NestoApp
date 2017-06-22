import { TestBed, ComponentFixture, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { MyApp } from '../../app/app.component';
import { RapportComponent } from './Rapport.component';
import { SelectorDireccionesEntrega } from '../../components/SelectorDireccionesEntrega/SelectorDireccionesEntrega'
import { SelectorDireccionesEntregaService } from '../../components/SelectorDireccionesEntrega/SelectorDireccionesEntrega.service'
import { NavParams, AlertController, LoadingController } from 'ionic-angular';
import { RapportService } from './Rapport.service';
import { Usuario } from '../../models/Usuario';
import { HttpModule } from '@angular/http';



let comp: RapportComponent;
let fixture: ComponentFixture<RapportComponent>;
let de: DebugElement;
let el: HTMLElement;

export class NavParamsMock {
    static returnParam = null;
    public get(key): any {
        if (NavParamsMock.returnParam) {
            return NavParamsMock.returnParam
        }
        return 'default';
    }
    static setParams(value) {
        NavParamsMock.returnParam = value;
    }
}

let rapportParams = {
    $id: "1",
    Aparatos: true,
    Aviso: true,
    Cliente: "15191     ",
    ClienteNuevo: true,
    Comentarios: "Probando desde el móvil",
    Contacto: "0  ",
    Direccion: "C/ SEGOVIA, 1 - LOCAL 13                          ",
    Empresa: "1  ",
    Estado: 0,
    Fecha: "2017-05-24T00:00:00",
    GestionAparatos: true,
    Id: 656639,
    Nombre: "CENTRO DE ESTÉTICA EL EDÉN, S.L.U.                ",
    Pedido: true,
    PrimeraVisita: true,
    Tipo: "V",
    TipoCentro: 0,
    Usuario: "NUEVAVISION\Carlos",
    Vendedor: null
};


describe('Rapport Component', () => {

    beforeEach(async(() => {
        
        NavParamsMock.setParams(rapportParams); // crear rapport y pasarlo como parámetro
        TestBed.configureTestingModule({

            declarations: [MyApp, RapportComponent, SelectorDireccionesEntrega],

            providers: [
                { provide: NavParams, useClass: NavParamsMock },
                RapportService,
                AlertController,
                LoadingController,
                Usuario,
                SelectorDireccionesEntregaService
            ],

            imports: [
                IonicModule.forRoot(MyApp),
                HttpModule,
            ]

        }).compileComponents();

    }));

    beforeEach(() => {

        fixture = TestBed.createComponent(RapportComponent);
        comp = fixture.componentInstance;

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
    
    it('muestra los comentarios del rapport', () => {

        fixture.detectChanges();

        de = fixture.debugElement.query(By.css('ion-textarea'));
        el = de.nativeElement;

        expect(el.textContent).toBe(rapportParams.Comentarios);

    });
});