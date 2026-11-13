import { esMismoUsuario } from './usuarios';

describe('esMismoUsuario (#276)', () => {
  it('es el mismo aunque se tecleara con otras mayúsculas', () => {
    expect(esMismoUsuario('NUEVAVISION\\DLopez', 'NUEVAVISION\\dlopez')).toBeTrue();
  });

  it('es el mismo aunque la BD lo traiga con espacios de relleno', () => {
    expect(esMismoUsuario('NUEVAVISION\\DLopez   ', 'NUEVAVISION\\dlopez')).toBeTrue();
    expect(esMismoUsuario('NUEVAVISION\\DLopez', ' nuevavision\\DLOPEZ ')).toBeTrue();
  });

  it('no es el mismo si es otra persona', () => {
    expect(esMismoUsuario('NUEVAVISION\\DLopez', 'NUEVAVISION\\Marta')).toBeFalse();
  });

  it('no es el mismo si falta alguno de los dos', () => {
    expect(esMismoUsuario(undefined, 'NUEVAVISION\\dlopez')).toBeFalse();
    expect(esMismoUsuario('NUEVAVISION\\DLopez', null)).toBeFalse();
    expect(esMismoUsuario('', '')).toBeFalse();
  });
});
