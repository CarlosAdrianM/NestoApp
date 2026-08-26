import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { Usuario } from 'src/app/models/Usuario';
import { CacheService } from '../../services/cache.service';
import { ClienteService } from '../cliente/cliente.service';

import { NifIncorrectosComponent } from './nif-incorrectos.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('NifIncorrectosComponent', () => {
  let component: NifIncorrectosComponent;
  let fixture: ComponentFixture<NifIncorrectosComponent>;
  let clienteServiceSpy: jasmine.SpyObj<ClienteService>;
  let usuario: Usuario;

  beforeEach(waitForAsync(() => {
    clienteServiceSpy = jasmine.createSpyObj('ClienteService', ['getNifIncorrectos', 'corregirNif']);
    clienteServiceSpy.getNifIncorrectos.and.returnValue(of([]));

    TestBed.configureTestingModule({
      declarations: [NifIncorrectosComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        Usuario,
        { provide: ClienteService, useValue: clienteServiceSpy },
        { provide: CacheService, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NifIncorrectosComponent);
    component = fixture.componentInstance;
    usuario = TestBed.inject(Usuario);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filtra por el vendedor del usuario cuando no puede ver todos', () => {
    usuario.vendedor = '12';
    usuario.permitirVerClientesTodosLosVendedores = false;

    component.cargar();

    expect(clienteServiceSpy.getNifIncorrectos).toHaveBeenCalledWith('12');
  });

  it('no filtra por vendedor si el usuario puede ver todos', () => {
    usuario.permitirVerClientesTodosLosVendedores = true;

    component.cargar();

    expect(clienteServiceSpy.getNifIncorrectos).toHaveBeenCalledWith(undefined);
  });

  it('guarda la lista devuelta y marca la carga como hecha', () => {
    clienteServiceSpy.getNifIncorrectos.and.returnValue(of([{ cliente: '15528' }]));

    component.cargar();

    expect(component.datos.length).toBe(1);
    expect(component.cargaInicialHecha).toBeTrue();
    expect(component.cargando).toBeFalse();
  });

  it('trata la fecha 2000-01-01 como sin dato', () => {
    expect(component.fechaMostrable('2000-01-01T00:00:00')).toBeNull();
    expect(component.fechaMostrable(null as any)).toBeNull();
    expect(component.fechaMostrable('2026-08-20T00:00:00')).not.toBeNull();
  });

  it('completa el refresher aunque falle la carga', () => {
    clienteServiceSpy.getNifIncorrectos.and.returnValue(throwError(() => ({ status: 500 })));
    const event = { target: { complete: jasmine.createSpy('complete') } };

    component.cargar(event);

    expect(event.target.complete).toHaveBeenCalled();
    expect(component.cargando).toBeFalse();
  });
});
