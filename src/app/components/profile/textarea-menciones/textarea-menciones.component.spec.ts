import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';

import { TextareaMencionesComponent } from './textarea-menciones.component';
import { NovedadesService } from 'src/app/services/novedades.service';

/** NestoApp#194 / NestoAPI#537: al escribir @ en Novedades, desplegable de a quién mencionar. */
describe('TextareaMencionesComponent (#194)', () => {
  let component: TextareaMencionesComponent;
  let fixture: ComponentFixture<TextareaMencionesComponent>;
  let servicio: any;
  let emitidos: string[];

  beforeEach(waitForAsync(() => {
    servicio = {
      leerMencionables: jasmine.createSpy('leerMencionables').and.returnValue(of([
        { Nombre: 'Carlos', Clave: 'Carlos', Aplicacion: 'NestoApp' },
        { Nombre: 'María', Clave: 'María', Aplicacion: 'NestoApp' }
      ]))
    };
    TestBed.configureTestingModule({
      declarations: [TextareaMencionesComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot()],
      providers: [{ provide: NovedadesService, useValue: servicio }]
    }).compileComponents();

    fixture = TestBed.createComponent(TextareaMencionesComponent);
    component = fixture.componentInstance;
    emitidos = [];
    component.textoChange.subscribe(t => emitidos.push(t));
  }));

  it('sin @ no se piden los mencionables ni sale el desplegable', () => {
    component.texto = 'Hola';
    component.actualizarCandidatos(4);

    expect(servicio.leerMencionables).not.toHaveBeenCalled();
    expect(component.candidatos).toEqual([]);
  });

  it('al escribir @ sale el desplegable, y se filtra mientras se escribe', () => {
    component.texto = 'Hola @';
    component.actualizarCandidatos(6);
    expect(component.candidatos.map(c => c.Nombre)).toEqual(['Carlos', 'María']);

    component.texto = 'Hola @mar';
    component.actualizarCandidatos(9);
    expect(component.candidatos.map(c => c.Nombre)).toEqual(['María']);
    expect(servicio.leerMencionables).toHaveBeenCalledTimes(1);
  });

  it('al elegir se inserta @Nombre, se avisa al padre y se cierra el desplegable', async () => {
    component.texto = 'Hola @mar';
    component.actualizarCandidatos(9);

    await component.elegir(component.candidatos[0]);

    expect(component.texto).toBe('Hola @María ');
    expect(emitidos).toEqual(['Hola @María ']);
    expect(component.candidatos).toEqual([]);
  });

  it('al terminar la mención (espacio) se cierra el desplegable', () => {
    component.texto = 'Hola @Carlos ';
    component.actualizarCandidatos(13);

    expect(component.candidatos).toEqual([]);
  });

  it('lo escrito llega al padre', async () => {
    await component.alEscribir({ detail: { value: 'Buenas' } });

    expect(emitidos).toEqual(['Buenas']);
  });
});
