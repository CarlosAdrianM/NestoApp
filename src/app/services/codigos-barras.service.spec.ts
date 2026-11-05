import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { CodigosBarrasService } from './codigos-barras.service';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';

/** NestoApp#262 (Nesto#582 / NestoAPI#605): resolver un código de barras a la referencia. */
describe('CodigosBarrasService (#262)', () => {
  let service: CodigosBarrasService;
  let httpMock: HttpTestingController;
  let alertas: any[];
  let hojas: any[];

  beforeEach(() => {
    alertas = []; hojas = [];
    TestBed.configureTestingModule({
      providers: [
        { provide: AlertController, useValue: { create: (o: any) => { alertas.push(o); return Promise.resolve({ present: () => Promise.resolve() }); } } },
        { provide: ActionSheetController, useValue: { create: (o: any) => { hojas.push(o); return Promise.resolve({ present: () => Promise.resolve() }); } } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(CodigosBarrasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  const peticion = () => httpMock.expectOne(r => r.url === Configuracion.API_URL + '/Productos/PorCodigoBarras');

  it('pregunta a la API por el código (sin espacios) y la empresa', fakeAsync(() => {
    service.resolverProducto(' 8437017506362 ');
    tick();
    const req = peticion();
    expect(req.request.params.get('codigo')).toBe('8437017506362');
    expect(req.request.params.get('empresa')).toBe(Configuracion.EMPRESA_POR_DEFECTO);
    req.flush([]);
    tick();
  }));

  it('un producto: su referencia', fakeAsync(() => {
    let resultado: string | null = 'x';
    service.resolverProducto('8437017506362').then(r => resultado = r);
    tick();
    peticion().flush([{ Producto: '38093 ', Nombre: 'CERA', Cantidad: 1, Principal: true }]);
    tick();
    expect(resultado).toBe('38093');
    expect(alertas.length).toBe(0);
  }));

  it('ninguno: aviso y null', fakeAsync(() => {
    let resultado: string | null = 'x';
    service.resolverProducto('8437017506362').then(r => resultado = r);
    tick();
    peticion().flush([]);
    tick();
    expect(resultado).toBeNull();
    expect(alertas[0].message).toBe('No hay ningún producto con el código de barras 8437017506362');
  }));

  it('varios: se elige en una hoja (con la caja si el código vale por varias unidades)', fakeAsync(() => {
    let resultado: string | null = 'x';
    service.resolverProducto('8437017506362').then(r => resultado = r);
    tick();
    peticion().flush([{ Producto: '38093', Nombre: 'CERA', Cantidad: 1, Principal: true }, { Producto: '38094', Nombre: 'CERA CAJA', Cantidad: 12, Principal: false }]);
    tick();
    expect(hojas.length).toBe(1);
    expect(hojas[0].buttons.map((b: any) => b.text)).toEqual(['38093 · CERA', '38094 · CERA CAJA (caja de 12)', 'Cancelar']);
    hojas[0].buttons[1].handler();
    tick();
    expect(resultado).toBe('38094');
  }));

  it('si la API falla se trata como ninguno', fakeAsync(() => {
    let resultado: string | null = 'x';
    service.resolverProducto('8437017506362').then(r => resultado = r);
    tick();
    peticion().flush('error', { status: 500, statusText: 'Error' });
    tick();
    expect(resultado).toBeNull();
  }));
});
