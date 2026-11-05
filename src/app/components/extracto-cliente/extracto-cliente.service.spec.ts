import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';
import { Usuario } from '../../models/Usuario';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { AuthService } from '../../services/auth/auth.service';
import { Storage } from '@ionic/storage-angular';

import { ExtractoClienteService } from './extracto-cliente.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ExtractoClienteService', () => {
  let service: ExtractoClienteService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [
        Usuario,
        File,
        AuthService,
        { provide: Storage, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    service = TestBed.inject(ExtractoClienteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

/** NestoApp#260 (NestoAPI#763): GET/PUT del horario preferible. */
describe('ExtractoClienteService: horario preferible (#260)', () => {
  let service: ExtractoClienteService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Usuario, File, AuthService, { provide: Storage, useValue: {} }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    });
    service = TestBed.inject(ExtractoClienteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lee el horario del contacto', () => {
    let resultado: any;
    service.leerHorarioPreferible('1 ', '15191 ', '0').subscribe(r => resultado = r);
    const req = httpMock.expectOne(Configuracion.API_URL + '/Clientes/1/15191/0/HorarioPreferible');
    expect(req.request.method).toBe('GET');
    req.flush({ Texto: 'L-V 10:00-14:00', Aviso: 'Lo intentaremos.' });
    expect(resultado.Texto).toBe('L-V 10:00-14:00');
  });

  it('si la API es anterior (404) o falla, null', () => {
    let resultado: any = 'x';
    service.leerHorarioPreferible('1', '15191', '0').subscribe(r => resultado = r);
    httpMock.expectOne(() => true).flush({}, { status: 404, statusText: 'Not Found' });
    expect(resultado).toBeNull();
  });

  it('guarda el horario en texto (vacío lo borra)', () => {
    service.guardarHorarioPreferible('1', '15191', '0', ' L-V 10:00-14:00 ').subscribe();
    const req = httpMock.expectOne(Configuracion.API_URL + '/Clientes/1/15191/0/HorarioPreferible');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ Empresa: '1', Cliente: '15191', Contacto: '0', Texto: 'L-V 10:00-14:00' });
    req.flush({ Texto: 'L-V 10:00-14:00' });
  });
});
