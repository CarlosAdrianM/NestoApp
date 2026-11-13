import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { RecogidasSolicitadasService } from './recogidas-solicitadas.service';

describe('RecogidasSolicitadasService (#259, NestoAPI#855)', () => {
  let servicio: RecogidasSolicitadasService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()] });
    servicio = TestBed.inject(RecogidasSolicitadasService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('leer: las del cliente y contacto', () => {
    servicio.leer('1', ' 15191 ', '0').subscribe(lista => expect(lista).toEqual([]));
    const req = http.expectOne(r => r.url.endsWith('/NotasEntrega/Recogidas/Solicitudes'));
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('cliente')).toBe('15191');
    expect(req.request.params.get('contacto')).toBe('0');
    expect(req.request.params.get('empresa')).toBe('1');
    req.flush(null);
  });

  it('solicitar: manda el cuerpo limpio, con la factura vacía como null', () => {
    servicio.solicitar({ Cliente: '15191', Contacto: '0', Texto: '  Aparato X  ', Bultos: 2, FacturaOriginal: '  ', QuienRecoge: 'Vendedor' }).subscribe();
    const req = http.expectOne(r => r.url.endsWith('/NotasEntrega/Recogidas/Solicitudes'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ Empresa: '1', Cliente: '15191', Contacto: '0', Texto: 'Aparato X', Bultos: 2, FacturaOriginal: null, QuienRecoge: 'Vendedor' });
    req.flush({});
  });

  it('anular: DELETE con el motivo', () => {
    servicio.anular(7, 'Ya no hace falta').subscribe();
    const req = http.expectOne(r => r.url.endsWith('/NotasEntrega/Recogidas/Solicitudes/7'));
    expect(req.request.method).toBe('DELETE');
    expect(req.request.params.get('motivo')).toBe('Ya no hace falta');
    req.flush({});
  });
});
