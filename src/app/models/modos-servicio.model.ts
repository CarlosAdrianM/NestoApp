/**
 * NestoApp#174 / NestoAPI#482: el modo de servicio del pedido, que sustituye a la casilla
 * «Servir junto». Réplica de Constantes.Pedidos.ModosServicio de NestoAPI y de ModosServicio
 * de Nesto (Nesto#476). El servidor normaliza en POST/PUT: sin modo deriva de servirJunto;
 * con modo, servirJunto pasa a ser su derivado (solo el 1 es true).
 */

export const MODOS_SERVICIO = {
  /** No sale nada hasta que hay stock de todo el pedido (ServirJunto = true). */
  TODO_JUNTO: 1,
  /** Sale lo que haya en cada pasada; tantas entregas como haga falta (ServirJunto = false). */
  SEGUN_VAYA_ENTRANDO: 2,
  /** Espera a que la reposición habitual traiga de las tiendas el stock que le corresponda;
   * cuando no queda nada que traer, sale lo que hay y el resto según vaya entrando. */
  TRAS_REPONER_DE_TIENDAS: 3,
  /** Sale ya lo que hay; lo que falta se entrega en UNA sola entrega más, cuando esté todo. */
  AHORA_LO_QUE_HAY_Y_EL_RESTO_DE_UNA_VEZ: 4,

  /**
   * Modo con el que nace un pedido si nadie dice otra cosa (Carlos, 16/09/26): «tras reponer
   * de tiendas». NO se arrastra el ServirJunto de la ficha del cliente (una referencia agotada
   * o anulada dejaba pedidos «todo junto» sin servir nunca).
   */
  POR_DEFECTO: 3
};

export interface ModoServicioItem {
  codigo: number;
  nombre: string;
  descripcion: string;
}

/** Los modos que se pueden elegir en pantalla, en el orden del selector.
 * Los nombres son contrato con Constantes.Pedidos.ModosServicio.Nombre de la API. */
export const LISTA_MODOS_SERVICIO: ModoServicioItem[] = [
  {
    codigo: MODOS_SERVICIO.TODO_JUNTO,
    nombre: 'Todo junto',
    descripcion: 'No sale nada hasta que hay stock de todo el pedido (la antigua casilla «Servir junto» marcada).'
  },
  {
    codigo: MODOS_SERVICIO.SEGUN_VAYA_ENTRANDO,
    nombre: 'Según vaya entrando',
    descripcion: 'Sale lo que haya en cada pasada, tantas entregas como haga falta (la antigua casilla desmarcada).'
  },
  {
    codigo: MODOS_SERVICIO.TRAS_REPONER_DE_TIENDAS,
    nombre: 'Tras reponer de tiendas',
    descripcion: 'Espera a que la reposición habitual traiga de las tiendas el stock que le corresponda al pedido; cuando no queda nada que traer, sale lo que hay y el resto según vaya entrando.'
  },
  {
    codigo: MODOS_SERVICIO.AHORA_LO_QUE_HAY_Y_EL_RESTO_DE_UNA_VEZ,
    nombre: 'Ahora lo que hay, el resto de una vez',
    descripcion: 'Sale ya lo que hay; lo que falta se entrega en una sola entrega más, cuando esté todo.'
  }
];

export function esModoValido(modo: number): boolean {
  return modo >= MODOS_SERVICIO.TODO_JUNTO && modo <= MODOS_SERVICIO.AHORA_LO_QUE_HAY_Y_EL_RESTO_DE_UNA_VEZ;
}

/** Solo el modo 1 es «servir junto» en el sentido de la columna y de las validaciones
 * (NestoAPI#220/#470): cualquier otro puede servir parcialmente en la primera pasada. */
export function esTodoJunto(modo: number): boolean {
  return modo === MODOS_SERVICIO.TODO_JUNTO;
}

/** A efectos de portes y de muestras/regalos («1 entrega → todo cuenta», NestoAPI#211):
 * 1 y 4 acaban en una entrega única del resto; 2 y 3 son por entrega. */
export function esEntregaUnica(modo: number): boolean {
  return modo === MODOS_SERVICIO.TODO_JUNTO || modo === MODOS_SERVICIO.AHORA_LO_QUE_HAY_Y_EL_RESTO_DE_UNA_VEZ;
}

/**
 * El modo que rige de verdad (misma regla que la API, Carlos 16/09/26): servirJunto marcado
 * SIEMPRE es «todo junto»; desmarcado, manda el modo parcial guardado (3 o 4) o, si no hay,
 * el 2. El bool es la autoridad de «todo junto» porque el Nesto viejo lo escribe en la tabla
 * sin conocer el modo; el modo solo refina el «no todo junto».
 */
export function modoEfectivo(modoServicio: number | null | undefined, servirJunto: boolean): number {
  if (servirJunto) {
    return MODOS_SERVICIO.TODO_JUNTO;
  }
  if (modoServicio === MODOS_SERVICIO.TRAS_REPONER_DE_TIENDAS ||
      modoServicio === MODOS_SERVICIO.AHORA_LO_QUE_HAY_Y_EL_RESTO_DE_UNA_VEZ) {
    return modoServicio;
  }
  return MODOS_SERVICIO.SEGUN_VAYA_ENTRANDO;
}

export function nombreModo(modo: number): string {
  const item = LISTA_MODOS_SERVICIO.find(m => m.codigo === modo);
  return item ? item.nombre : `Modo ${modo}`;
}

/** El valor del parámetro de usuario ModoServicioPorDefecto, o POR_DEFECTO si falta o no vale. */
export function parsearModoPorDefecto(valorParametro: string | null | undefined): number {
  const modo = parseInt((valorParametro || '').trim(), 10);
  return !isNaN(modo) && esModoValido(modo) ? modo : MODOS_SERVICIO.POR_DEFECTO;
}
