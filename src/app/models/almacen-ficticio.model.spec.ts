import {
  agruparPorFamilia, almacenPorDefecto, filtrarExistencias, textoAlmacenFicticio, textoResumenExistencias, totalUnidades
} from './almacen-ficticio.model';

/** NestoApp#292 (NestoAPI#894): «Mi almacén». */
describe('Almacén ficticio del vendedor (#292)', () => {
  const productos = [
    { Producto: '45958', Nombre: 'CREMA HIDRATANTE', Familia: 'EVA', NombreFamilia: 'Eva Visnú', Unidades: 3 },
    { Producto: '12345', Nombre: 'ACEITE DE ARGÁN', Familia: 'EVA', NombreFamilia: 'Eva Visnú', Unidades: 1 },
    { Producto: '99999', Nombre: 'CERA ROSETA', Familia: 'DEP', NombreFamilia: 'Depilación', Unidades: -2 },
    { Producto: '77777', Nombre: 'COSA SUELTA', Familia: '', NombreFamilia: null, Unidades: 5 }
  ];

  it('al entrar, el suyo; si no tiene ninguno propio, el primero; sin almacenes, ninguno', () => {
    expect(almacenPorDefecto([{ Codigo: 'AB' }, { Codigo: 'IF', EsSuyo: true }]).Codigo).toBe('IF');
    expect(almacenPorDefecto([{ Codigo: 'AB' }, { Codigo: 'IM' }]).Codigo).toBe('AB');
    expect(almacenPorDefecto([])).toBeNull();
    expect(almacenPorDefecto(null)).toBeNull();
  });

  it('el nombre del almacén, marcando el suyo', () => {
    expect(textoAlmacenFicticio({ Codigo: 'IF ', Descripcion: 'Israel Fernández', EsSuyo: true })).toBe('IF · Israel Fernández (el suyo)');
    expect(textoAlmacenFicticio({ Codigo: 'AB', Descripcion: '' })).toBe('AB');
  });

  it('busca por referencia o por nombre, sin mayúsculas ni tildes y con varias palabras', () => {
    expect(filtrarExistencias(productos, '4595').map(p => p.Producto)).toEqual(['45958']);
    expect(filtrarExistencias(productos, 'argan aceite').map(p => p.Producto)).toEqual(['12345']);
    expect(filtrarExistencias(productos, 'depilacion').map(p => p.Producto)).toEqual(['99999']);
    expect(filtrarExistencias(productos, '  ').length).toBe(4);
    expect(filtrarExistencias(productos, 'no existe')).toEqual([]);
  });

  it('agrupa por familia en orden alfabético, «Sin familia» al final, y los productos por nombre', () => {
    const grupos = agruparPorFamilia(productos);
    expect(grupos.map(g => g.nombre)).toEqual(['Depilación', 'Eva Visnú', 'Sin familia']);
    expect(grupos[1].productos.map(p => p.Producto)).toEqual(['12345', '45958']);
    expect(grupos[1].unidades).toBe(4);
    expect(grupos[0].unidades).toBe(-2);
  });

  it('el total de unidades y el resumen', () => {
    expect(totalUnidades(productos)).toBe(7);
    expect(textoResumenExistencias(4, 7)).toBe('4 productos · 7 unidades');
    expect(textoResumenExistencias(1, 1)).toBe('1 producto · 1 unidad');
    expect(textoResumenExistencias(0, 0)).toBe('0 productos · 0 unidades');
  });
});
