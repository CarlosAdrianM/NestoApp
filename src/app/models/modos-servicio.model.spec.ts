import {
  MODOS_SERVICIO,
  LISTA_MODOS_SERVICIO,
  esModoValido,
  esTodoJunto,
  esEntregaUnica,
  modoEfectivo,
  nombreModo
} from './modos-servicio.model';

/**
 * NestoApp#174 / NestoAPI#482: el modo de servicio del pedido, que sustituye a la casilla
 * «Servir junto». Réplica de ModosServicio de Nesto (Nesto#476) y de
 * Constantes.Pedidos.ModosServicio de NestoAPI: misma regla de efectivo, misma lista.
 */
describe('ModosServicio (#174)', () => {
  it('servirJunto marcado SIEMPRE es «todo junto», diga lo que diga el modo guardado', () => {
    expect(modoEfectivo(3, true)).toBe(MODOS_SERVICIO.TODO_JUNTO);
    expect(modoEfectivo(null, true)).toBe(MODOS_SERVICIO.TODO_JUNTO);
  });

  it('desmarcado, manda el modo parcial guardado (3 o 4)', () => {
    expect(modoEfectivo(3, false)).toBe(MODOS_SERVICIO.TRAS_REPONER_DE_TIENDAS);
    expect(modoEfectivo(4, false)).toBe(MODOS_SERVICIO.AHORA_LO_QUE_HAY_Y_EL_RESTO_DE_UNA_VEZ);
  });

  it('desmarcado y sin modo (pedido viejo, solo bool) es «según vaya entrando»', () => {
    expect(modoEfectivo(null, false)).toBe(MODOS_SERVICIO.SEGUN_VAYA_ENTRANDO);
    expect(modoEfectivo(undefined, false)).toBe(MODOS_SERVICIO.SEGUN_VAYA_ENTRANDO);
  });

  it('un 1 guardado con el bool desmarcado no puede ser todo junto (el bool es la autoridad)', () => {
    expect(modoEfectivo(1, false)).toBe(MODOS_SERVICIO.SEGUN_VAYA_ENTRANDO);
  });

  it('1 y 4 son entrega única (portes y muestras); 2 y 3 son por entrega', () => {
    expect(esEntregaUnica(MODOS_SERVICIO.TODO_JUNTO)).toBeTrue();
    expect(esEntregaUnica(MODOS_SERVICIO.AHORA_LO_QUE_HAY_Y_EL_RESTO_DE_UNA_VEZ)).toBeTrue();
    expect(esEntregaUnica(MODOS_SERVICIO.SEGUN_VAYA_ENTRANDO)).toBeFalse();
    expect(esEntregaUnica(MODOS_SERVICIO.TRAS_REPONER_DE_TIENDAS)).toBeFalse();
  });

  it('solo el 1 es todo junto', () => {
    expect(esTodoJunto(1)).toBeTrue();
    expect(esTodoJunto(2)).toBeFalse();
    expect(esTodoJunto(3)).toBeFalse();
    expect(esTodoJunto(4)).toBeFalse();
  });

  it('el por defecto es «tras reponer de tiendas» (Carlos, 16/09/26)', () => {
    expect(MODOS_SERVICIO.POR_DEFECTO).toBe(MODOS_SERVICIO.TRAS_REPONER_DE_TIENDAS);
  });

  it('la lista del selector tiene los cuatro modos en orden', () => {
    expect(LISTA_MODOS_SERVICIO.map(m => m.codigo)).toEqual([1, 2, 3, 4]);
    expect(LISTA_MODOS_SERVICIO.every(m => !!m.nombre && !!m.descripcion)).toBeTrue();
  });

  it('valida el rango 1..4', () => {
    expect(esModoValido(0)).toBeFalse();
    expect(esModoValido(1)).toBeTrue();
    expect(esModoValido(4)).toBeTrue();
    expect(esModoValido(5)).toBeFalse();
  });

  it('el nombre coincide con el contrato de la API', () => {
    expect(nombreModo(1)).toBe('Todo junto');
    expect(nombreModo(2)).toBe('Según vaya entrando');
    expect(nombreModo(3)).toBe('Tras reponer de tiendas');
    expect(nombreModo(4)).toBe('Ahora lo que hay, el resto de una vez');
  });
});
