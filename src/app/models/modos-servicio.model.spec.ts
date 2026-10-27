import {
  MODOS_SERVICIO,
  LISTA_MODOS_SERVICIO,
  esModoValido,
  esTodoJunto,
  esEntregaUnica,
  modoEfectivo,
  nombreModo,
  esModoPermitido,
  leerModoServicioNoPermitido,
  leerModoConPicking,
  esRetenido,
  textoMotivoModoServicio,
  origenModoServicio,
  ORIGEN_MODO_SERVICIO
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

/**
 * NestoApp#187 / NestoAPI#518: el servidor dice qué modos tienen sentido para el pedido según el
 * almacén y el stock. La app no calcula nada: pinta lo que diga la API.
 */
describe('Modos permitidos por el servidor (#187)', () => {
  const modos = [
    { Modo: 1, Nombre: 'Todo junto', Permitido: true, Motivo: null },
    { Modo: 2, Nombre: 'Según vaya entrando', Permitido: false, Motivo: 'Todo el pedido tiene stock en Algete: sale todo junto.' }
  ];

  it('sin respuesta del servidor, todos los modos se pueden elegir (como hasta ahora)', () => {
    expect(esModoPermitido(null, 2)).toBeTrue();
    expect(esModoPermitido([], 3)).toBeTrue();
  });

  it('un modo que el servidor marca como no permitido no se puede elegir', () => {
    expect(esModoPermitido(modos, 1)).toBeTrue();
    expect(esModoPermitido(modos, 2)).toBeFalse();
  });

  it('un modo que el servidor no menciona no se bloquea', () => {
    expect(esModoPermitido(modos, 4)).toBeTrue();
  });

  it('lee el rechazo MODO_SERVICIO_NO_PERMITIDO al guardar con el modo que sí vale', () => {
    const error: any = {
      apiError: {
        error: {
          code: 'MODO_SERVICIO_NO_PERMITIDO',
          message: 'El stock ha cambiado mientras montabas el pedido. Elige «Todo junto» y vuelve a guardar.',
          details: { modoSugerido: 1, modoSugeridoNombre: 'Todo junto', modosPermitidos: [1] }
        }
      }
    };

    const rechazo = leerModoServicioNoPermitido(error);

    expect(rechazo).not.toBeNull();
    expect(rechazo!.modoSugerido).toBe(1);
    expect(rechazo!.modosPermitidos).toEqual([1]);
    expect(rechazo!.mensaje).toContain('Elige «Todo junto»');
  });

  it('cualquier otro error no es un rechazo de modo', () => {
    expect(leerModoServicioNoPermitido({ apiError: { error: { code: 'PEDIDO_VALIDACION_FALLO', message: 'x' } } } as any)).toBeNull();
    expect(leerModoServicioNoPermitido({ message: 'sin conexión' } as any)).toBeNull();
    expect(leerModoServicioNoPermitido(null)).toBeNull();
  });

  // NestoApp#191 / NestoAPI#533: con picking (o albarán de hoy) el PUT no deja cambiar el modo.
  it('lee el rechazo MODO_CON_PICKING con el mensaje de la API', () => {
    const error: any = {
      apiError: { error: { code: 'MODO_CON_PICKING', message: 'Este pedido ya está en preparación (tiene picking)...' } }
    };

    expect(leerModoConPicking(error)).toContain('tiene picking');
  });

  it('cualquier otro error no es un rechazo por picking', () => {
    expect(leerModoConPicking({ apiError: { error: { code: 'MODO_SERVICIO_NO_PERMITIDO', message: 'x' } } } as any)).toBeNull();
    expect(leerModoConPicking({ message: 'sin conexión' } as any)).toBeNull();
    expect(leerModoConPicking(null)).toBeNull();
  });
});

/** NestoApp#254 / NestoAPI#698: el modo 5 «Retenido» solo se enseña; lo ponen Retener/Liberar. */
describe('Modo «Retenido» (#254)', () => {
  it('el 5 se llama «Retenido» y no está en el selector', () => {
    expect(MODOS_SERVICIO.RETENIDO).toBe(5);
    expect(nombreModo(5)).toBe('Retenido');
    expect(LISTA_MODOS_SERVICIO.some(m => m.codigo === 5)).toBeFalse();
    expect(esModoValido(5)).toBeFalse();
    expect(esRetenido(5)).toBeTrue();
    expect(esRetenido(3)).toBeFalse();
  });

  it('el efectivo de un pedido retenido es 5, diga lo que diga servirJunto', () => {
    expect(modoEfectivo(5, false)).toBe(5);
    expect(modoEfectivo(5, true)).toBe(5);
    expect(modoEfectivo(3, true)).toBe(1);
  });

  it('retenido no es «todo junto» ni entrega única', () => {
    expect(esTodoJunto(5)).toBeFalse();
    expect(esEntregaUnica(5)).toBeFalse();
  });
});

/** NestoApp#245 (novedad 731): la frase gris es la recomendación, no lo elegido. */
describe('Texto de la recomendación bajo «Entrega» (#245)', () => {
  it('si lo elegido no es lo recomendado, lo dice con el nombre del modo', () => {
    expect(textoMotivoModoServicio(1, 4, 'Sale lo que hay y el resto en una sola entrega.'))
      .toBe('Recomendado: «Ahora lo que hay, el resto de una vez». Sale lo que hay y el resto en una sola entrega.');
  });

  it('si coincide, solo el motivo', () => {
    expect(textoMotivoModoServicio(4, 4, 'Sale lo que hay.')).toBe('Sale lo que hay.');
  });

  it('sin sugerencia del servidor (p. ej. un rechazo o un aviso), el motivo tal cual', () => {
    expect(textoMotivoModoServicio(1, null, 'Se mantiene «Todo junto».')).toBe('Se mantiene «Todo junto».');
  });

  it('sin motivo no hay frase', () => {
    expect(textoMotivoModoServicio(1, 4, '')).toBe('');
    expect(textoMotivoModoServicio(1, 4, null)).toBe('');
  });
});

/** NestoApp#250 / NestoAPI#704 (caso 929152): de dónde sale el modo que se graba. */
describe('Origen del modo de servicio (#250)', () => {
  it('si lo eligió el vendedor, «Usuario» aunque hubiera sugerencia', () => {
    expect(origenModoServicio(true, false, 4)).toBe(ORIGEN_MODO_SERVICIO.USUARIO);
    expect(origenModoServicio(true, true, null)).toBe('Usuario');
  });

  it('tras una corrección o un rechazo, «Corregido»', () => {
    expect(origenModoServicio(false, true, 4)).toBe('Corregido');
  });

  it('la sugerencia aplicada sin tocar, «Sugerido»', () => {
    expect(origenModoServicio(false, false, 4)).toBe('Sugerido');
  });

  it('sin respuesta del servidor, «PorDefecto»', () => {
    expect(origenModoServicio(false, false, null)).toBe('PorDefecto');
  });
});
