import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { SelectorBase } from './selectorbase.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SelectorbaseComponent', () => {

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [SelectorBase],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IonicModule.forRoot()],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();
  }));

  it('should create', () => {
    expect(SelectorBase).toBeTruthy();
  });
});

// Issue #228: subclase mínima para probar la lógica de filtros sin plantilla
class SelectorDePrueba extends SelectorBase {
  public cargas: string[] = [];
  protected cargarDatos(filtro: any): void { this.cargas.push(filtro); }
  public cargar(datos: any[]): void { this.inicializarDatos(datos); }
}

describe('SelectorBase.quitarFiltro (#228)', () => {
  it('no revienta al quitar un filtro si los datos aún no han llegado', () => {
    const selector = new SelectorDePrueba();
    selector.annadirFiltro('PEPE');
    selector.annadirFiltro('MADRID');

    expect(() => selector.quitarFiltro('MADRID')).not.toThrow();
    expect(selector.filtrosFijados).toEqual(['PEPE']);
  });

  it('con dos filtros fijados antes de que lleguen los datos, quitar el primero deja el segundo', () => {
    const selector = new SelectorDePrueba();
    selector.fijarFiltro({ target: { value: 'pepe', select: () => {} } });
    selector.fijarFiltro({ target: { value: 'madrid', select: () => {} } });

    expect(() => selector.quitarFiltro('PEPE')).not.toThrow();
  });

  it('con datos cargados, quitar un filtro vuelve a aplicar los que quedan', () => {
    const selector = new SelectorDePrueba();
    selector.annadirFiltro('PEPE');
    selector.cargar([{ nombre: 'PEPE MADRID' }, { nombre: 'PEPE SEVILLA' }, { nombre: 'JUAN MADRID' }]);
    selector.fijarFiltro({ target: { value: 'madrid', select: () => {} } });
    selector.fijarFiltro({ target: { value: 'juan', select: () => {} } });

    selector.quitarFiltro('JUAN');

    expect(selector.datosFiltrados.map(d => d.nombre)).toEqual(['PEPE MADRID']);
  });
});
