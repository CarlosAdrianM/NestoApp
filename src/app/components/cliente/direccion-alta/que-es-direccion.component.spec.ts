import { MOTIVO_LOCAL, MOTIVO_SIN_TIPO } from 'src/app/models/direccion-alta.model';
import { QueEsDireccionComponent } from './que-es-direccion.component';

// NestoApp#286 / #290: «¿Qué es?» solo pinta y avisa; las reglas están en direccion-alta.model.
describe('QueEsDireccionComponent', () => {
  let component: QueEsDireccionComponent;

  beforeEach(() => {
    component = new QueEsDireccionComponent();
  });

  it('enseña los campos del tipo elegido', () => {
    component.bloque = { tipoLugar: 'Local' };
    expect(component.esLocal).toBeTrue();
    expect(component.esPiso).toBeFalse();
    component.bloque.tipoLugar = 'Piso';
    expect(component.esPiso).toBeTrue();
  });

  it('la vista previa es lo que se guardará', () => {
    component.bloque = { tipoLugar: 'Local', numeroLocal: '6', rotulo: 'El Edén' };
    expect(component.vistaPrevia).toBe('LOCAL 6 · RÓTULO: EL EDÉN');
    expect(component.aviso).toBeNull();
  });

  it('en el alta avisa de lo que falta, también sin tipo', () => {
    component.bloque = {};
    expect(component.aviso).toBe(MOTIVO_SIN_TIPO);
    component.bloque = { tipoLugar: 'Local' };
    expect(component.aviso).toBe(MOTIVO_LOCAL);
    expect(component.vistaPrevia).toBe('');
  });

  it('al modificar, sin tipo elegido no avisa de nada', () => {
    component.esAlta = false;
    component.bloque = {};
    expect(component.aviso).toBeNull();
  });

  it('el aviso de revisar tras cambiar la calle manda sobre los demás', () => {
    component.esAlta = false;
    component.bloque = { tipoLugar: 'Casa' };
    component.avisoRevisar = 'Ha cambiado la calle…';
    expect(component.aviso).toBe('Ha cambiado la calle…');
  });

  it('avisa a la pantalla cuando se cambia algo', () => {
    const cambiado = jasmine.createSpy('cambiado');
    component.cambiado.subscribe(cambiado);
    component.alCambiar();
    expect(cambiado).toHaveBeenCalled();
  });
});
