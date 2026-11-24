import { fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { BloqueDireccionAltaComponent } from './bloque-direccion-alta.component';

// NestoApp#288 (NestoAPI#879): la dirección de entrega del alta, con las mismas preguntas que la fiscal.
describe('BloqueDireccionAltaComponent', () => {
  let component: BloqueDireccionAltaComponent;
  let servicio: any;

  beforeEach(() => {
    servicio = {
      buscarSugerenciasDireccion: jasmine.createSpy('buscar').and.returnValue(of([{ placeId: 'abc', descripcion: 'Calle la Granja, Alcobendas' }])),
      leerDetalleDireccion: jasmine.createSpy('detalle').and.returnValue(of({ calle: 'Calle la Granja', numero: '99', codigoPostal: '28108', poblacion: 'Alcobendas', provincia: 'Madrid' }))
    };
    component = new BloqueDireccionAltaComponent(servicio);
    component.bloque = {};
  });

  afterEach(() => component.ngOnDestroy());

  it('busca en Google al teclear (con espera) y la dirección deja de estar verificada', fakeAsync(() => {
    component.bloque.direccionVerificada = true;

    component.buscar({ detail: { value: 'Calle la Gr' } });
    expect(component.bloque.direccionVerificada).toBeFalse();
    tick(300);

    expect(servicio.buscarSugerenciasDireccion).toHaveBeenCalledWith('Calle la Gr', jasmine.any(String));
    expect(component.sugerencias.length).toBe(1);
  }));

  it('con menos de tres letras no busca', fakeAsync(() => {
    component.buscar({ detail: { value: 'Ca' } });
    tick(300);

    expect(servicio.buscarSugerenciasDireccion).not.toHaveBeenCalled();
    expect(component.sugerencias).toEqual([]);
  }));

  it('al elegir una sugerencia queda verificada y el código postal no se teclea', () => {
    component.elegir({ placeId: 'abc' });

    expect(component.bloque.direccionCalleNumero).toBe('Calle la Granja, 99');
    expect(component.bloque.codigoPostal).toBe('28108');
    expect(component.bloque.direccionVerificada).toBeTrue();
    expect(component.cpEditable).toBeFalse();
    expect(component.sugerencias).toEqual([]);
  });

  it('si Google no da el código postal, se deja escribir y lo dice', () => {
    servicio.leerDetalleDireccion.and.returnValue(of({ calle: 'Calle Nueva', numero: '3', poblacion: 'Algete' }));

    component.elegir({ placeId: 'abc' });

    expect(component.cpEditable).toBeTrue();
    expect(component.ayudaCp).toContain('escríbalo');
  });

  it('si Google no da el número, se pide; cambiarlo obliga a volver a comprobarlo', () => {
    servicio.leerDetalleDireccion.and.returnValue(of({ calle: 'Calle Sor Livia Alcorta', codigoPostal: '28100', poblacion: 'Alcobendas' }));
    component.elegir({ placeId: 'abc' });
    expect(component.bloque.numeroSinDarPorGoogle).toBeTrue();

    component.bloque.numeroConfirmadoSinGoogle = true;
    component.bloque.direccionValidada = true;
    component.numeroCambiado();

    expect(component.bloque.numeroConfirmadoSinGoogle).toBeFalse();
    expect(component.bloque.direccionValidada).toBeFalse();
  });

  it('si el detalle falla, se sigue buscando', () => {
    servicio.leerDetalleDireccion.and.returnValue(throwError(() => new Error('x')));
    component.sugerencias = [{ placeId: 'abc' }];

    component.elegir({ placeId: 'abc' });

    expect(component.sugerencias).toEqual([]);
    expect(component.bloque.direccionVerificada).toBeFalsy();
  });

  it('limpiar borra la dirección buscada y la validada', () => {
    component.bloque = { direccion: 'C/ LA GRANJA, 99', direccionValidada: true, direccionCalleNumero: 'Calle la Granja, 99', direccionVerificada: true, numeroSinDarPorGoogle: true, numero: '99' };

    component.limpiar();

    expect(component.bloque.direccion).toBe('');
    expect(component.bloque.direccionCalleNumero).toBe('');
    expect(component.bloque.direccionVerificada).toBeFalse();
    expect(component.bloque.numero).toBeNull();
  });
});
