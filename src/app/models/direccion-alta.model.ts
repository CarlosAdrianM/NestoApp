/**
 * NestoApp#286 / #288 / #290 (NestoAPI#874 y #879, gemelas de Nesto#643): la dirección de un cliente en el alta y en la
 * modificación. Reglas PURAS, gemelas de `Direccion2Cliente` y `NumeroPropioDireccion` de NestoAPI y de
 * `BloqueDireccionAlta` de Nesto. La API vuelve a validar todo: esto es para avisar antes y pintar la vista previa.
 *
 * Un «bloque» es cualquier objeto con estas claves en camelCase: sirve igual la ficha del cliente (dirección fiscal)
 * que la dirección de entrega del alta.
 */
export interface BloqueDireccion {
  /** Lo que se busca en Google (calle y número). */
  direccionCalleNumero?: string;
  /** La dirección ya validada por la API (calle y número, 50). */
  direccion?: string;
  direccionVerificada?: boolean;
  direccionValidada?: boolean;
  codigoPostal?: string;
  /** Google eligió la dirección pero no da su código postal: entonces sí se teclea. */
  codigoPostalSinDarPorGoogle?: boolean;
  /** Google dio la calle sin número: se pide aparte. */
  numeroSinDarPorGoogle?: boolean;
  numero?: string | null;
  numeroConfirmadoSinGoogle?: boolean;
  tipoLugar?: string | null;
  piso?: string | null;
  puerta?: string | null;
  numeroLocal?: string | null;
  rotulo?: string | null;
  numeroNave?: string | null;
  otroTexto?: string | null;
  poblacion?: string;
  provincia?: string;
  pais?: string;
  ruta?: string;
  telefono?: string;
  comentariosRuta?: string;
  comentariosPicking?: string;
  [clave: string]: any;
}

export const TIPO_PISO = 'Piso';
export const TIPO_LOCAL = 'Local';
export const TIPO_CASA = 'Casa';
export const TIPO_NAVE = 'Nave';
export const TIPO_OTRO = 'Otro';

/** Los valores son los del CHECK de la base de datos: no cambiarlos. */
export const TIPOS_LUGAR: { codigo: string, nombre: string }[] = [
  { codigo: TIPO_PISO, nombre: 'Piso' },
  { codigo: TIPO_LOCAL, nombre: 'Local' },
  { codigo: TIPO_CASA, nombre: 'Casa o chalet' },
  { codigo: TIPO_NAVE, nombre: 'Nave o polígono' },
  { codigo: TIPO_OTRO, nombre: 'Otro' }
];

export const LONGITUD_DIRECCION2 = 100;

export const MOTIVO_SIN_TIPO = 'Indique qué es la dirección (piso, local, casa o chalet, nave u otro): sin eso el repartidor no la encuentra.';
export const MOTIVO_PISO = 'En un piso indique el piso y la puerta (por ejemplo, 1º D).';
export const MOTIVO_LOCAL = 'En un local indique qué pone en el rótulo de la entrada: es lo que busca el repartidor.';
export const MOTIVO_NAVE = 'En una nave indique su número.';
export const MOTIVO_OTRO = 'Describa el lugar en «Otro» (por ejemplo, «CENTRO COMERCIAL, PLANTA 2»).';
export const MOTIVO_SIN_NUMERO = 'Google no tiene el número de esta calle: escríbalo en «Número» (cifras, o «S/N» si no tiene).';
export const MOTIVO_FORMATO_NUMERO = 'En «Número» solo va el número del portal (por ejemplo, 99) o S/N. ' +
  'Lo demás (piso, local, edificio, rótulo…) va en «¿Qué es?».';
export const MOTIVO_DIRECCION_A_MANO = 'La dirección tiene que elegirse de las que propone Google, no escribirse a mano. ' +
  'Borre la dirección con el botón de al lado, búsquela y selecciónela en la lista.';
export const MOTIVO_SIN_CODIGO_POSTAL = 'Google no tiene el código postal de esta dirección: escríbalo en «Código postal».';
export const MOTIVO_SIN_DIRECCION = 'busque la dirección y elíjala en la lista de Google.';
export const PREFIJO_ENTREGA = 'Dirección de entrega: ';
export const TITULO_NUMERO_SIN_GOOGLE = 'Número de la calle';
export const TITULO_REVISAR_DIRECCION2 = 'Ha cambiado la dirección';
export const TEXTO_ENTREGA_EN_OTRA_DIRECCION = 'La entrega es en otra dirección';

export interface ResultadoDireccion2 {
  valida: boolean;
  /** Por qué no vale (de usted); null si vale. */
  motivo: string | null;
  /** Lo que se guardará, en mayúsculas («1º D», «LOCAL 6 · RÓTULO: EL EDÉN»); null si no vale. */
  direccion2: string | null;
}

function limpiar(texto: string | null | undefined): string | null {
  const limpio = (texto ?? '').toString().trim().replace(/\s+/g, ' ');
  return limpio ? limpio.toLocaleUpperCase('es-ES') : null;
}

function tipoCanonico(tipo: string | null | undefined): string | null {
  const limpio = (tipo ?? '').toString().trim().toLowerCase();
  return TIPOS_LUGAR.find(t => t.codigo.toLowerCase() === limpio)?.codigo ?? null;
}

/**
 * Compone y valida la Dirección 2: Piso = piso y puerta («1º D»); Local = nº opcional + RÓTULO obligatorio (sin valor
 * por defecto: el nombre fiscal no es lo que pone en la puerta); Casa («CASA»); Nave = nº («NAVE 4»); Otro = texto.
 */
export function componerDireccion2(b: BloqueDireccion | null | undefined): ResultadoDireccion2 {
  const mal = (motivo: string): ResultadoDireccion2 => ({ valida: false, motivo, direccion2: null });
  const tipo = tipoCanonico(b?.tipoLugar);
  if (!tipo) {
    return mal(MOTIVO_SIN_TIPO);
  }
  let texto: string;
  switch (tipo) {
    case TIPO_PISO: {
      const piso = limpiar(b.piso), puerta = limpiar(b.puerta);
      if (!piso || !puerta) {
        return mal(MOTIVO_PISO);
      }
      const numerico = /^(\d+)\s*[ºª°oO]?$/.exec(piso);
      texto = (numerico ? numerico[1] + 'º' : piso) + ' ' + puerta;
      break;
    }
    case TIPO_LOCAL: {
      const rotulo = limpiar(b.rotulo);
      if (!rotulo) {
        return mal(MOTIVO_LOCAL);
      }
      const local = limpiar(b.numeroLocal);
      texto = (local ? 'LOCAL ' + local : 'LOCAL') + ' · RÓTULO: ' + rotulo;
      break;
    }
    case TIPO_CASA:
      texto = 'CASA';
      break;
    case TIPO_NAVE: {
      const nave = limpiar(b.numeroNave);
      if (!nave) {
        return mal(MOTIVO_NAVE);
      }
      texto = 'NAVE ' + nave;
      break;
    }
    default: {
      const otro = limpiar(b.otroTexto);
      if (!otro) {
        return mal(MOTIVO_OTRO);
      }
      texto = otro;
    }
  }
  return texto.length > LONGITUD_DIRECCION2
    ? mal(`La dirección 2 («${texto}») no puede superar ${LONGITUD_DIRECCION2} caracteres: acórtela.`)
    : { valida: true, motivo: null, direccion2: texto };
}

// ------------------------------------------------------------------ Número propio (Google dio la calle sin número)

export const SIN_NUMERO = 'S/N';

/** «13 b» → «13B»; «13 bis» → «13BIS»; «s/n», «sn», «sin número» → «S/N»; vacío → null. */
export function normalizarNumeroPortal(numero: string | null | undefined): string | null {
  const limpio = (numero ?? '').toString().trim();
  if (!limpio) {
    return null;
  }
  if (/^(S\s*[\/.\-]?\s*N(º|O|\.)?|SIN\s+N(Ú|U)MERO)\.?$/i.test(limpio)) {
    return SIN_NUMERO;
  }
  return limpio.replace(/\s+/g, '').toUpperCase();
}

/** Solo el portal: cifras con, como mucho, una letra o «BIS» detrás; o «S/N». «Nº 99» o «99 local 6» no valen. */
export function numeroPortalValido(numero: string | null | undefined): boolean {
  const n = normalizarNumeroPortal(numero);
  return n === SIN_NUMERO || (n !== null && /^\d{1,5}(BIS|[A-Z])?$/.test(n));
}

// ------------------------------------------------------------------ Lo que da Google al elegir la dirección

/**
 * Aplica al bloque el detalle de la dirección elegida en Google (claves en camelCase). Con código postal, pareja
 * verificada; sin él pero con calle y población, también verificada y el CP se teclea (novedad 482); sin número,
 * se pide aparte. Devuelve true si la dirección queda verificada.
 */
export function aplicarDetalleGoogle(b: BloqueDireccion, detalle: any): boolean {
  b.direccionCalleNumero = (detalle?.direccionCalleNumero || '').trim() ||
    [detalle?.calle, detalle?.numero].filter(Boolean).join(', ').trim();
  b.numero = null;
  b.numeroConfirmadoSinGoogle = false;
  const cp = (detalle?.codigoPostal || '').toString().trim();
  if (cp) {
    b.codigoPostal = cp;
    b.direccionVerificada = true;
    b.codigoPostalSinDarPorGoogle = false;
  } else if ((detalle?.calle || '').trim() && (detalle?.poblacion || '').trim()) {
    b.codigoPostal = '';
    b.direccionVerificada = true;
    b.codigoPostalSinDarPorGoogle = true;
  } else {
    b.direccionVerificada = false;
    b.codigoPostalSinDarPorGoogle = false;
  }
  if (detalle?.paisIso) { b.pais = detalle.paisIso.toString().trim().toUpperCase(); }
  // Población/provincia de Google, en MAYÚSCULAS (un CP puede cubrir varias poblaciones).
  if (detalle?.poblacion) { b.poblacion = detalle.poblacion.toString().trim().toUpperCase(); }
  if (detalle?.provincia) { b.provincia = detalle.provincia.toString().trim().toUpperCase(); }
  b.numeroSinDarPorGoogle = !!b.direccionVerificada && !(detalle?.numero || '').toString().trim();
  return !!b.direccionVerificada;
}

/** Al borrar la dirección buscada se pierde todo lo que dio Google. */
export function olvidarGoogle(b: BloqueDireccion): void {
  b.direccionCalleNumero = '';
  b.direccionVerificada = false;
  b.codigoPostalSinDarPorGoogle = false;
  b.numeroSinDarPorGoogle = false;
  b.numero = null;
  b.numeroConfirmadoSinGoogle = false;
}

/**
 * ¿Se puede teclear el código postal? Al CREAR (cliente o contacto) nunca, salvo que Google haya elegido la dirección
 * sin dar su CP. Al modificar, como siempre: mientras la dirección no venga de Google (o Google no dé el CP).
 */
export function codigoPostalEditable(b: BloqueDireccion | null | undefined, esAlta: boolean): boolean {
  const verificada = !!b?.direccionVerificada, sinDar = !!b?.codigoPostalSinDarPorGoogle;
  return esAlta ? verificada && sinDar : !verificada || sinDar;
}

export function ayudaCodigoPostal(b: BloqueDireccion | null | undefined, esAlta: boolean): string {
  if (!b?.direccionVerificada) {
    return esAlta ? 'Sale solo al elegir la dirección en la lista de Google (no se escribe a mano).' : '';
  }
  return b.codigoPostalSinDarPorGoogle ? 'Google no tiene el código postal de esta dirección: escríbalo usted.' : '';
}

// ------------------------------------------------------------------ Qué falta para seguir

/** Hay una dirección buscándose o ya validada. */
export function hayDireccion(b: BloqueDireccion | null | undefined): boolean {
  return !!(b?.direccion || '').trim() || !!(b?.direccionCalleNumero || '').trim();
}

/** La dirección ya está en la ficha y no se está metiendo otra: no hay nada que pedirle a Google. */
function direccionYaPuesta(b: BloqueDireccion): boolean {
  return !!(b.direccion || '').trim() && !(b.direccionCalleNumero || '').trim();
}

/**
 * Por qué no se puede seguir con esta dirección en un ALTA (de usted), o null si vale. Con `prefijo`
 * («Dirección de entrega: ») para la segunda dirección. La modificación solo mira `motivoRevisarDireccion2`.
 */
export function motivoNoSePuedeSeguir(b: BloqueDireccion | null | undefined, direccionObligatoria: boolean = false,
  prefijo: string = ''): string | null {
  const prefijar = (m: string | null) => m === null ? null : prefijo + m;
  if (!b || !hayDireccion(b)) {
    return direccionObligatoria ? prefijar(MOTIVO_SIN_DIRECCION) : null;
  }
  if (!direccionYaPuesta(b)) {
    if (!b.direccionVerificada) {
      return prefijar(MOTIVO_DIRECCION_A_MANO);
    }
    if (b.codigoPostalSinDarPorGoogle && !(b.codigoPostal || '').trim()) {
      return prefijar(MOTIVO_SIN_CODIGO_POSTAL);
    }
    if (b.numeroSinDarPorGoogle && !(b.numero || '').trim()) {
      return prefijar(MOTIVO_SIN_NUMERO);
    }
    if (b.numeroSinDarPorGoogle && !numeroPortalValido(b.numero)) {
      return prefijar(MOTIVO_FORMATO_NUMERO);
    }
  }
  return prefijar(componerDireccion2(b).motivo);
}

// ------------------------------------------------------------------ Lo que viaja a la API

const CAMPOS_QUE_ES = ['tipoLugar', 'piso', 'puerta', 'numeroLocal', 'rotulo', 'numeroNave', 'otroTexto'];

/** «¿Qué es?» con solo los campos de su tipo (los de otro tipo que se hubieran tecleado antes no viajan). */
export function camposQueEs(b: BloqueDireccion): BloqueDireccion {
  const tipo = tipoCanonico(b?.tipoLugar);
  return {
    tipoLugar: tipo,
    piso: tipo === TIPO_PISO ? b.piso ?? null : null,
    puerta: tipo === TIPO_PISO ? b.puerta ?? null : null,
    numeroLocal: tipo === TIPO_LOCAL ? b.numeroLocal ?? null : null,
    rotulo: tipo === TIPO_LOCAL ? b.rotulo ?? null : null,
    numeroNave: tipo === TIPO_NAVE ? b.numeroNave ?? null : null,
    otroTexto: tipo === TIPO_OTRO ? b.otroTexto ?? null : null
  };
}

/** El número propio solo viaja si Google no lo dio. */
export function camposNumero(b: BloqueDireccion): { numero: string | null, numeroConfirmadoSinGoogle: boolean } {
  return {
    numero: b?.numeroSinDarPorGoogle ? (b.numero || '').trim() || null : null,
    numeroConfirmadoSinGoogle: !!b?.numeroSinDarPorGoogle && !!b?.numeroConfirmadoSinGoogle
  };
}

/** `ClienteCrear.DireccionEntrega` (#288): la segunda dirección del alta de un cliente nuevo. */
export function paraDireccionEntrega(b: BloqueDireccion): any {
  return {
    direccion: b.direccion,
    direccionVerificada: !!b.direccionVerificada,
    ...camposNumero(b),
    ...camposQueEs(b),
    codigoPostal: b.codigoPostal,
    poblacion: b.poblacion,
    provincia: b.provincia,
    ruta: b.ruta,
    telefono: b.telefono,
    comentariosRuta: b.comentariosRuta,
    comentariosPicking: b.comentariosPicking
  };
}

/**
 * El alta tal como viaja: «¿Qué es?» y el número limpios y, si se ha marcado «La entrega es en otra dirección»,
 * la segunda dirección. No toca el objeto de la pantalla.
 */
export function clienteParaCrear(cliente: any, entrega: BloqueDireccion | null): any {
  const dto = { ...cliente, ...camposNumero(cliente), ...camposQueEs(cliente) };
  delete dto.quitarDireccion2;
  delete dto.direccion2;
  if (entrega) {
    dto.direccionEntrega = paraDireccionEntrega(entrega);
  } else {
    delete dto.direccionEntrega;
  }
  return dto;
}

// ------------------------------------------------------------------ Al MODIFICAR (#290, NestoAPI#874 corte 2)

/** Lo que hay que recordar de la Dirección 2 mientras se modifica una ficha. */
export interface RevisionDireccion2 {
  /** La calle con la que se abrió la ficha. */
  direccionAlCargar: string;
  /** La Dirección 2 guardada (vacía si no tenía). */
  direccion2Guardada: string;
  /** El vendedor ha tocado «¿Qué es?», ha dicho «Sigue siendo así» o ha pulsado «Quitar». */
  revisada: boolean;
  /** Ha tocado alguno de los campos de «¿Qué es?»: hay que mandarlos. */
  tocada: boolean;
  /** Ha pulsado «Quitar» (y tenía): viaja QuitarDireccion2. */
  quitar: boolean;
}

export function nuevaRevisionDireccion2(cliente: any): RevisionDireccion2 {
  return {
    direccionAlCargar: (cliente?.direccion || '').toString().trim(),
    direccion2Guardada: (cliente?.direccion2 || '').toString().trim(),
    revisada: false,
    tocada: false,
    quitar: false
  };
}

export function calleCambiada(cliente: any, r: RevisionDireccion2 | null): boolean {
  return !!r && (cliente?.direccion || '').toString().trim().toLowerCase() !== r.direccionAlCargar.toLowerCase();
}

/** Si cambia la calle y el cliente tenía Dirección 2, no se guarda sin revisarla. */
export function hayQueRevisarDireccion2(cliente: any, r: RevisionDireccion2 | null): boolean {
  return !!r && !!r.direccion2Guardada && !r.revisada && calleCambiada(cliente, r);
}

export function textoRevisarDireccion2(direccion2Guardada: string): string {
  return `Ha cambiado la calle y este cliente tenía «¿Qué es?» = «${direccion2Guardada}». Revíselo antes de guardar: ` +
    'pulse «Sigue siendo así» si vale para la dirección nueva, cámbielo o pulse «Quitar».';
}

export function puedeQuitarDireccion2(cliente: any, r: RevisionDireccion2 | null): boolean {
  return !!r && !r.quitar && (!!r.direccion2Guardada || !!tipoCanonico(cliente?.tipoLugar));
}

/** «Quitar»: el cliente se queda sin «¿Qué es?» (se borra al guardar si tenía). */
export function quitarDireccion2(cliente: any, r: RevisionDireccion2): void {
  CAMPOS_QUE_ES.forEach(c => cliente[c] = null);
  r.quitar = !!r.direccion2Guardada;
  r.revisada = true;
  r.tocada = false;
}

/** El vendedor ha cambiado «¿Qué es?»: cuenta como revisado y, si elige un tipo, deja sin efecto el «Quitar». */
export function queEsTocado(cliente: any, r: RevisionDireccion2 | null): void {
  if (!r) {
    return;
  }
  r.revisada = true;
  r.tocada = true;
  if (tipoCanonico(cliente?.tipoLugar)) {
    r.quitar = false;
  }
}

/**
 * ¿Viaja «¿Qué es?» en la modificación? Si el vendedor lo ha tocado o si ha cambiado la calle (la API lo exige con
 * la dirección nueva): entonces va el tipo con sus campos. Sin tipo elegido no viaja nada.
 */
function viajaQueEs(cliente: any, r: RevisionDireccion2 | null): boolean {
  return !!r && !r.quitar && !!tipoCanonico(cliente?.tipoLugar) && (r.tocada || calleCambiada(cliente, r));
}

/**
 * Por qué no se puede guardar la modificación (de usted) o null: falta revisar «¿Qué es?» tras cambiar la calle,
 * o lo que se ha puesto en «¿Qué es?» no vale. Sin tipo elegido, ni aviso ni envío.
 */
export function motivoNoSePuedeModificar(cliente: any, r: RevisionDireccion2 | null): string | null {
  if (hayQueRevisarDireccion2(cliente, r)) {
    return textoRevisarDireccion2(r.direccion2Guardada);
  }
  return viajaQueEs(cliente, r) ? componerDireccion2(cliente).motivo : null;
}

/**
 * La modificación tal como viaja: con «¿Qué es?» tocado, el tipo y sus campos (la API compone y valida como en el
 * alta), también si ha cambiado la calle; con «Quitar», QuitarDireccion2; sin tocar nada, ningún campo (la API
 * conserva lo guardado).
 */
export function clienteParaModificar(cliente: any, r: RevisionDireccion2 | null): any {
  const dto = { ...cliente, numero: null, numeroConfirmadoSinGoogle: false };
  delete dto.direccion2;
  delete dto.direccionEntrega;
  CAMPOS_QUE_ES.forEach(c => delete dto[c]);
  delete dto.quitarDireccion2;
  if (r?.quitar) {
    dto.quitarDireccion2 = true;
  } else if (viajaQueEs(cliente, r)) {
    Object.assign(dto, camposQueEs(cliente));
  }
  return dto;
}

// ------------------------------------------------------------------ Mensaje del alta

/**
 * El aviso del alta. Con dirección de entrega la API devuelve el principal con `ContactoEntrega` (el contacto creado),
 * que queda como entrega por defecto. `creado` es la ficha tal como la devuelve POST api/Clientes.
 */
export function mensajeClienteCreado(creado: any): string {
  const numero = (creado?.['Nº_Cliente'] ?? '').toString().trim();
  const contacto = (creado?.Contacto ?? '').toString().trim();
  const entrega = (creado?.ContactoEntrega ?? '').toString().trim();
  const principal = numero + '/' + contacto;
  if (!entrega || entrega === contacto) {
    return 'Se ha creado correctamente el cliente: ' + principal;
  }
  return 'Se ha creado correctamente el cliente ' + principal + ' (dirección fiscal) y su dirección de entrega, el contacto ' +
    numero + '/' + entrega + ', que queda como entrega por defecto.';
}
