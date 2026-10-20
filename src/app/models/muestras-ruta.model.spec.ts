import { muestrasPorEncimaDeAlgete, saleDeAlgetePorRuta, textoMuestrasAlgete } from './muestras-ruta.model';

describe('Muestras en pedidos por ruta desde Algete (#233)', () => {
  const muestra = (extra: any = {}) => ({ producto: '17404', texto: 'MUESTRA', subGrupo: 'Muestras y material promocional',
    cantidad: 3, cantidadDisponible: 1, stockActualizado: true, ...extra });

  it('solo las rutas propias y de agencia que salen de Algete, con almacén ALG', () => {
    expect(saleDeAlgetePorRuta('16', 'ALG')).toBeTrue();
    expect(saleDeAlgetePorRuta('AT ', 'alg')).toBeTrue();
    expect(saleDeAlgetePorRuta('GLV', 'ALG')).toBeFalse();
    expect(saleDeAlgetePorRuta('16', 'REI')).toBeFalse();
  });

  it('marca las muestras que piden más de lo que hay', () => {
    expect(muestrasPorEncimaDeAlgete([muestra()]).length).toBe(1);
    expect(muestrasPorEncimaDeAlgete([muestra({ subGrupo: 'MMP' })]).length).toBe(1);
  });

  it('no marca lo que no es muestra, lo que tiene stock, sin stock actualizado ni las líneas ya grabadas', () => {
    expect(muestrasPorEncimaDeAlgete([muestra({ subGrupo: 'Cremas' })]).length).toBe(0);
    expect(muestrasPorEncimaDeAlgete([muestra({ cantidadDisponible: 3 })]).length).toBe(0);
    expect(muestrasPorEncimaDeAlgete([muestra({ stockActualizado: false })]).length).toBe(0);
    expect(muestrasPorEncimaDeAlgete([muestra()], () => false).length).toBe(0);
  });

  it('el texto dice cuánto pide y cuánto hay', () => {
    const texto = textoMuestrasAlgete([muestra(), muestra({ producto: '17405', cantidadDisponible: -2 })]);
    expect(texto).toContain('17404 MUESTRA: pide 3, solo hay 1 en Algete');
    expect(texto).toContain('17405 MUESTRA: pide 3, no hay ninguna en Algete');
    expect(texto).toContain('¿Quiere dejarlas en lo que hay en Algete');
  });
});
