import { Globo, MAX_GLOBOS_SEGUIDOS, globosParaEnsenar, pantallaDeUrl } from './globo.model';

describe('Globos (consejos) en NestoApp (NestoAPI#774)', () => {
  it('la pantalla es la ruta, sin barra ni parámetros', () => {
    expect(pantallaDeUrl('/pedido-venta?empresa=1&numero=5')).toBe('pedido-venta');
    expect(pantallaDeUrl('/recogidas#x')).toBe('recogidas');
    expect(pantallaDeUrl('/')).toBe('');
    expect(pantallaDeUrl(null)).toBe('');
  });

  it('como mucho dos seguidos, por orden, y sin los ya enseñados en la sesión', () => {
    const globo = (Id: number, Orden: number): Globo => ({ Id, Aplicacion: 'NestoApp', Pantalla: 'cliente', Ancla: null, Titulo: null, Texto: 't', Orden, NovedadId: null });
    const lista = [globo(3, 30), globo(1, 10), globo(2, 20)];
    expect(MAX_GLOBOS_SEGUIDOS).toBe(2);
    expect(globosParaEnsenar(lista, new Set<number>()).map(g => g.Id)).toEqual([1, 2]);
    expect(globosParaEnsenar(lista, new Set<number>([1])).map(g => g.Id)).toEqual([2, 3]);
    expect(globosParaEnsenar(null, new Set<number>())).toEqual([]);
  });
});
