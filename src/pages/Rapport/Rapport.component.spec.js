import { TestBed, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IonicModule } from 'ionic-angular';
import { MyApp } from '../../app/app.component';
import { RapportComponent } from './Rapport.component';
import { SelectorDireccionesEntrega } from '../../components/SelectorDireccionesEntrega/SelectorDireccionesEntrega';
import { SelectorDireccionesEntregaService } from '../../components/SelectorDireccionesEntrega/SelectorDireccionesEntrega.service';
import { NavParams, AlertController, LoadingController } from 'ionic-angular';
import { RapportService } from './Rapport.service';
import { Usuario } from '../../models/Usuario';
import { HttpModule } from '@angular/http';
var comp;
var fixture;
var de;
var el;
var NavParamsMock = /** @class */ (function () {
    function NavParamsMock() {
    }
    NavParamsMock.prototype.get = function (key) {
        if (NavParamsMock.returnParam) {
            return NavParamsMock.returnParam;
        }
        return 'default';
    };
    NavParamsMock.setParams = function (value) {
        NavParamsMock.returnParam = value;
    };
    NavParamsMock.returnParam = null;
    return NavParamsMock;
}());
export { NavParamsMock };
var rapportParams = {
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
describe('Rapport Component', function () {
    beforeEach(async(function () {
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
    beforeEach(function () {
        fixture = TestBed.createComponent(RapportComponent);
        comp = fixture.componentInstance;
    });
    afterEach(function () {
        fixture.destroy();
        comp = null;
        de = null;
        el = null;
    });
    it('is created', function () {
        expect(fixture).toBeTruthy();
        expect(comp).toBeTruthy();
    });
    it('muestra los comentarios del rapport', function () {
        fixture.detectChanges();
        de = fixture.debugElement.query(By.css('ion-textarea'));
        el = de.nativeElement;
        expect(el.textContent).toBe(rapportParams.Comentarios);
    });
});
//# sourceMappingURL=Rapport.component.spec.js.map