/**
 * NestoApp#285 (ampliación, Carlos 24/11/26) — gemela de Nesto#642 `FusionCambiosPedido.vb`: «Recargar conservando mis cambios».
 * LA REGLA, pura:
 * - El cambio del usuario (delta) = la foto del pedido al cargarlo frente a lo que tiene en pantalla: líneas nuevas (sin Nº de
 *   orden), líneas cambiadas (por Nº de orden, campo a campo), líneas borradas y campos de cabecera cambiados.
 * - Se aplica encima del pedido recién leído. Solo hay choque si los dos han tocado lo mismo: el mismo campo de la misma línea,
 *   una línea que uno borró y el otro cambió, o el mismo campo de cabecera, y a valores distintos (si los dos pusieron lo mismo,
 *   no choca). Las líneas nuevas nunca chocan.
 * - Los campos que dependen del producto (IVA, recargo, descuento del producto) van con el producto: una sola pregunta.
 * Los prepagos y los vencimientos a mano no se tocan en la app: se quedan los del servidor.
 */

export type TipoConflictoPedido = 'CampoCabecera' | 'CampoLinea' | 'LineaBorradaPorElOtro' | 'LineaBorradaPorUsted';

export const TEXTO_RECARGAR_CONSERVANDO = 'Recargar conservando mis cambios';
export const TEXTO_RECARGAR_SIN_CAMBIOS = 'Recargar sin mis cambios';
export const TITULO_PEDIDO_MODIFICADO = 'Pedido modificado';
export const TEXTO_PUEDE_RECARGAR_CONSERVANDO =
  'No se ha guardado nada. Puede recargarlo conservando sus cambios: solo se le preguntará por lo que hayan cambiado los dos.';
export const TITULO_RECARGAR_SIN_CAMBIOS = 'Recargar sin sus cambios';
export const TEXTO_CONFIRMAR_RECARGAR_SIN_CAMBIOS =
  'Al recargar el pedido sin sus cambios se pierde todo lo que no ha guardado (líneas nuevas incluidas). ¿Desea recargarlo así?';
export const TITULO_RECARGAR_PEDIDO = 'Recargar el pedido';
export const TEXTO_SIN_FOTO =
  'Desde que guardó el pedido no se ha vuelto a leer, así que no se pueden separar sus cambios de los de la otra persona. ' +
  '¿Desea recargarlo sin sus cambios?';
export const TEXTO_NO_SE_HA_RECARGADO = 'No se ha recargado nada: el pedido sigue como lo tenía.';
export const TEXTO_RECARGADO_SIN_CAMBIOS = 'Se ha recargado el pedido. No tenía cambios sin guardar.';
export const TEXTO_RECARGADO_CON_CAMBIOS = 'Se ha recargado el pedido con sus cambios encima. Revíselo y guárdelo.';
export const TITULO_CONFLICTO = 'Los dos han cambiado lo mismo';

/** Un choque de la fusión, con lo que hay que preguntar. Por defecto se queda lo del otro (lo guardado). */
export class ConflictoPedido {
  public tipo: TipoConflictoPedido;
  /** «la cantidad», «la forma de pago». */
  public etiqueta = '';
  /** Nº de orden de la línea (0 en la cabecera). */
  public numeroLinea = 0;
  public producto: string | null = null;
  public valorUsted = '';
  public valorOtro = '';
  public aplicarLoDeUsted: () => void = () => { };

  constructor(datos: Partial<ConflictoPedido>) {
    Object.assign(this, datos);
  }

  /** La pregunta, de usted: «Alfredo cambió la cantidad de la línea 3 (38093) a 5 y usted a 8: ¿con cuál se queda?». */
  public pregunta(otro: string | null | undefined): string {
    const quien = (otro || '').trim() || 'Otra persona';
    switch (this.tipo) {
      case 'LineaBorradaPorElOtro':
        return `${quien} borró ${this.textoLinea()} y usted la cambió: ¿la vuelve a añadir con sus cambios?`;
      case 'LineaBorradaPorUsted':
        return `${quien} cambió ${this.textoLinea()} y usted la borró: ¿la borra igualmente?`;
      case 'CampoLinea':
        return `${quien} cambió ${this.etiqueta} de ${this.textoLinea()} a ${this.valorOtro} y usted a ${this.valorUsted}: ¿con cuál se queda?`;
      default:
        return `${quien} cambió ${this.etiqueta} a ${this.valorOtro} y usted a ${this.valorUsted}: ¿con cuál se queda?`;
    }
  }

  /** El botón de quedarse con lo del usuario. */
  public get textoOpcionUsted(): string {
    switch (this.tipo) {
      case 'LineaBorradaPorElOtro': return 'Volver a añadirla';
      case 'LineaBorradaPorUsted': return 'Borrarla';
      default: return `Con ${this.valorUsted} (el mío)`;
    }
  }

  /** El botón de quedarse con lo del otro (lo guardado). */
  public get textoOpcionOtro(): string {
    switch (this.tipo) {
      case 'LineaBorradaPorElOtro': return 'Dejarla borrada';
      case 'LineaBorradaPorUsted': return 'Dejarla';
      default: return `Con ${this.valorOtro}`;
    }
  }

  private textoLinea(): string {
    const producto = (this.producto || '').toString().trim();
    return producto ? `la línea ${this.numeroLinea} (${producto})` : `la línea ${this.numeroLinea}`;
  }
}

/** El pedido del servidor con los cambios del usuario encima, y lo que queda por preguntar. */
export interface ResultadoFusionPedido {
  /** El pedido recién leído con los cambios del usuario que no chocan (y, al resolver, los que sí). */
  pedido: any;
  conflictos: ConflictoPedido[];
  /** Cuántos cambios del usuario se han puesto sin preguntar. */
  cambiosAplicados: number;
}

/** Decide un choque: true = lo del usuario; false = lo del otro (no se toca nada). */
export function resolverConflicto(conflicto: ConflictoPedido | null | undefined, quedarseConLoDeUsted: boolean): void {
  if (conflicto && quedarseConLoDeUsted) {
    conflicto.aplicarLoDeUsted();
  }
}

interface Campo {
  etiqueta: string;
  /** Las propiedades que se comparan y se copian juntas (la primera es la que se enseña). */
  claves: string[];
  formato?: (valor: any) => string;
}

const porcentaje = (valor: any): string =>
  typeof valor === 'number' ? `${numero(valor * 100, 2)} %` : mostrar(valor);

const CAMPOS_CABECERA: Campo[] = [
  { etiqueta: 'la forma de pago', claves: ['formaPago'] },
  { etiqueta: 'los plazos de pago', claves: ['plazosPago'] },
  { etiqueta: 'el primer vencimiento', claves: ['primerVencimiento'] },
  { etiqueta: 'la cuenta de cobro (CCC)', claves: ['ccc'] },
  { etiqueta: 'el IVA', claves: ['iva'] },
  { etiqueta: 'el vendedor', claves: ['vendedor'] },
  { etiqueta: 'el periodo de facturación', claves: ['periodoFacturacion'] },
  { etiqueta: 'la ruta', claves: ['ruta'] },
  { etiqueta: 'la serie', claves: ['serie'] },
  { etiqueta: 'el contacto de entrega', claves: ['contacto'] },
  { etiqueta: 'el contacto de cobro', claves: ['contactoCobro'] },
  { etiqueta: 'los comentarios', claves: ['comentarios'] },
  { etiqueta: 'el comentario de picking', claves: ['comentarioPicking'] },
  { etiqueta: 'su pedido (P.O.)', claves: ['suPedido'] },
  { etiqueta: '«no comisiona»', claves: ['noComisiona'] },
  { etiqueta: '«mantener junto»', claves: ['mantenerJunto'] },
  { etiqueta: '«servir junto»', claves: ['servirJunto'] },
  { etiqueta: 'el modo de entrega', claves: ['modoServicio'] },
  { etiqueta: 'el modo de facturación', claves: ['modoFacturacion'] },
  { etiqueta: '«avisar con importe al coger el picking»', claves: ['avisarConImporteAlCogerPicking'] },
  { etiqueta: '«nota de entrega»', claves: ['notaEntrega'] },
  { etiqueta: '«recoge en tienda»', claves: ['RecogeEnTienda'] }
];

const CAMPOS_LINEA: Campo[] = [
  { etiqueta: 'el producto', claves: ['Producto', 'iva', 'PorcentajeIva', 'PorcentajeRecargoEquivalencia', 'DescuentoProducto'] },
  { etiqueta: 'el texto', claves: ['texto'] },
  { etiqueta: 'la cantidad', claves: ['Cantidad'] },
  { etiqueta: 'el precio', claves: ['PrecioUnitario'] },
  { etiqueta: 'el descuento', claves: ['DescuentoLinea'], formato: porcentaje },
  { etiqueta: '«aplicar descuento»', claves: ['AplicarDescuento'] },
  { etiqueta: 'la fecha de entrega', claves: ['fechaEntrega'] },
  { etiqueta: 'el almacén', claves: ['almacen'] },
  { etiqueta: 'la forma de venta', claves: ['formaVenta'] },
  { etiqueta: 'la delegación', claves: ['delegacion'] },
  { etiqueta: 'el tipo de línea', claves: ['tipoLinea'] },
  { etiqueta: 'la oferta', claves: ['oferta'] },
  { etiqueta: 'el visto bueno', claves: ['vistoBueno'] }
];

const CLAVES_CABECERA = CAMPOS_CABECERA.reduce((todas, c) => todas.concat(c.claves), [] as string[]);
const CLAVES_LINEA = CAMPOS_LINEA.reduce((todas, c) => todas.concat(c.claves), [] as string[]);

/**
 * La foto del pedido: una copia suelta de lo que la fusión compara (cabecera y líneas, estas con su Nº de orden). Se hace al
 * cargar el pedido. Lee por propiedad, así que vale igual para lo que llega de la API que para las líneas de la pantalla.
 */
export function fotoDelPedido(pedido: any): any {
  if (!pedido) {
    return null;
  }
  const foto: any = {};
  CLAVES_CABECERA.forEach(clave => foto[clave] = pedido[clave]);
  foto.Lineas = (pedido.Lineas || []).filter((l: any) => !!l).map((l: any) => {
    const linea: any = { id: l.id };
    CLAVES_LINEA.forEach(clave => linea[clave] = l[clave]);
    return linea;
  });
  return foto;
}

/**
 * Pone encima de `servidor` (lo recién leído; se MODIFICA) lo que el usuario ha cambiado de `foto` (el pedido al cargarlo) a
 * `mio` (lo que tiene en pantalla). Los choques no se aplican: van en `conflictos`.
 */
export function fusionarCambiosPedido(foto: any, mio: any, servidor: any): ResultadoFusionPedido {
  if (!foto || !mio || !servidor) {
    throw new Error('Para fusionar hacen falta la foto, el pedido en pantalla y el del servidor.');
  }
  const resultado: ResultadoFusionPedido = { pedido: servidor, conflictos: [], cambiosAplicados: 0 };
  fusionarCabecera(foto, mio, servidor, resultado);
  fusionarLineas(foto, mio, servidor, resultado);
  return resultado;
}

function fusionarCabecera(foto: any, mio: any, servidor: any, resultado: ResultadoFusionPedido): void {
  for (const campo of CAMPOS_CABECERA) {
    const enFoto = leer(campo, foto), enMio = leer(campo, mio), enServidor = leer(campo, servidor);
    if (iguales(enMio, enFoto)) {
      continue; // el usuario no lo ha tocado: se queda lo del servidor
    }
    if (iguales(enServidor, enFoto) || iguales(enServidor, enMio)) {
      copiar(campo, mio, servidor);
      resultado.cambiosAplicados++;
    } else {
      resultado.conflictos.push(new ConflictoPedido({
        tipo: 'CampoCabecera', etiqueta: campo.etiqueta,
        valorUsted: mostrar(enMio[0], campo.formato), valorOtro: mostrar(enServidor[0], campo.formato),
        aplicarLoDeUsted: () => copiar(campo, mio, servidor)
      }));
    }
  }
}

/** Las líneas en blanco (producto sin referencia) no cuentan: se quitan al guardar. */
function esLineaEnBlanco(l: any): boolean {
  return Number(l.tipoLinea) === 1 && !(l.Producto || '').toString().trim();
}

function fusionarLineas(foto: any, mio: any, servidor: any, resultado: ResultadoFusionPedido): void {
  if (!servidor.Lineas) {
    servidor.Lineas = [];
  }
  const lineasFoto = new Map<number, any>();
  (foto.Lineas || []).filter((l: any) => l && Number(l.id) > 0).forEach((l: any) => {
    if (!lineasFoto.has(Number(l.id))) {
      lineasFoto.set(Number(l.id), l);
    }
  });
  const lineasMias: any[] = (mio.Lineas || []).filter((l: any) => !!l);
  const delServidor = (id: number) => servidor.Lineas.find((l: any) => l && Number(l.id) === id);

  // 1. Las nuevas (sin Nº de orden): nunca chocan
  lineasMias.filter(l => !(Number(l.id) > 0) && !esLineaEnBlanco(l)).forEach(nueva => {
    anadirCopia(nueva, servidor);
    resultado.cambiosAplicados++;
  });

  // 2. Las que había al cargar: cambiadas o borradas por el usuario
  lineasFoto.forEach((enFoto, id) => {
    const enMio = lineasMias.find(l => Number(l.id) === id);
    const enServidor = delServidor(id);

    if (!enMio) {
      // La ha borrado el usuario
      if (!enServidor) {
        return; // el otro también
      }
      const quitar = () => {
        const indice = servidor.Lineas.indexOf(enServidor);
        if (indice >= 0) {
          servidor.Lineas.splice(indice, 1);
        }
      };
      if (camposCambiados(enFoto, enServidor).length === 0) {
        quitar();
        resultado.cambiosAplicados++;
      } else {
        resultado.conflictos.push(new ConflictoPedido({
          tipo: 'LineaBorradaPorUsted', numeroLinea: id, producto: enFoto.Producto, aplicarLoDeUsted: quitar
        }));
      }
      return;
    }

    const cambiados = camposCambiados(enFoto, enMio);
    if (cambiados.length === 0) {
      return;
    }
    if (!enServidor) {
      // La ha borrado el otro y el usuario la ha cambiado
      resultado.conflictos.push(new ConflictoPedido({
        tipo: 'LineaBorradaPorElOtro', numeroLinea: id, producto: enFoto.Producto,
        aplicarLoDeUsted: () => anadirCopia(enMio, servidor)
      }));
      return;
    }
    for (const campo of cambiados) {
      const vFoto = leer(campo, enFoto), vMio = leer(campo, enMio), vServidor = leer(campo, enServidor);
      if (iguales(vServidor, vFoto) || iguales(vServidor, vMio)) {
        copiar(campo, enMio, enServidor);
        resultado.cambiosAplicados++;
      } else {
        resultado.conflictos.push(new ConflictoPedido({
          tipo: 'CampoLinea', etiqueta: campo.etiqueta, numeroLinea: id, producto: enFoto.Producto,
          valorUsted: mostrar(vMio[0], campo.formato), valorOtro: mostrar(vServidor[0], campo.formato),
          aplicarLoDeUsted: () => copiar(campo, enMio, enServidor)
        }));
      }
    }
  });
}

function camposCambiados(antes: any, despues: any): Campo[] {
  return CAMPOS_LINEA.filter(c => !iguales(leer(c, antes), leer(c, despues)));
}

/**
 * Una copia de la línea del usuario como línea nueva (sin Nº de orden) al final del pedido. Copia suelta y plana: lo que tiene
 * la línea de la pantalla más su `iva` (que allí es una propiedad calculada), sin la tabla de IVA que cuelga de ella.
 */
function anadirCopia(linea: any, pedido: any): void {
  const copia: any = { ...linea, iva: linea.iva, id: 0 };
  delete copia._iva;
  delete copia.parametrosIva;
  pedido.Lineas.push(copia);
}

function leer(campo: Campo, de: any): any[] {
  return campo.claves.map(clave => de ? de[clave] : undefined);
}

function copiar(campo: Campo, origen: any, destino: any): void {
  campo.claves.forEach(clave => destino[clave] = origen[clave]);
}

/** Iguales con null = "" y sin los espacios de relleno de la BD. */
export function iguales(a: any[], b: any[]): boolean {
  return a.length === b.length && a.every((valor, i) => igual(valor, b[i]));
}

function igual(a: any, b: any): boolean {
  const vacio = (v: any) => v === null || v === undefined;
  if (typeof a === 'string' || typeof b === 'string' || (vacio(a) && vacio(b))) {
    return (vacio(a) ? '' : a.toString()).trim() === (vacio(b) ? '' : b.toString()).trim();
  }
  if (vacio(a) || vacio(b)) {
    return false;
  }
  return a === b;
}

function numero(valor: number, decimales: number): string {
  return (Math.round(valor * Math.pow(10, decimales)) / Math.pow(10, decimales)).toString().replace('.', ',');
}

const FECHA_ISO = /^(\d{4})-(\d{2})-(\d{2})(T|$)/;

function mostrar(valor: any, formato?: (valor: any) => string): string {
  if (formato) {
    return formato(valor);
  }
  if (valor === null || valor === undefined) {
    return '(vacío)';
  }
  if (typeof valor === 'boolean') {
    return valor ? 'sí' : 'no';
  }
  if (typeof valor === 'number') {
    return numero(valor, 4);
  }
  const texto = valor.toString().trim();
  const fecha = FECHA_ISO.exec(texto);
  if (fecha) {
    return `${fecha[3]}/${fecha[2]}/${fecha[1]}`;
  }
  return texto.length === 0 ? '(vacío)' : texto;
}
