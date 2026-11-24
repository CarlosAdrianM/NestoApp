/**
 * NestoApp#293 / NestoAPI#889 (Black Friday 2026): en un pedido de campaña «solo en stock», lo que no hay en
 * stock va por defecto SIN el descuento de la campaña. Antes de guardar se pregunta al vendedor, como en Nesto.
 * Respuesta de POST api/PedidosVenta/AvisoCampanaSoloEnStock (PascalCase, siempre 200).
 */
export interface ProductoCampanaSoloEnStock {
  Producto: string;
  Nombre: string;
  Pedidas: number;
  Disponibles: number;
  ConDescuento: number;
  SinDescuento: number;
  DescuentoCampana: number;
  DescuentoSinCampana: number;
  PrecioSinCampana: number;
  Texto: string;
}

export interface AvisoCampanaSoloEnStock {
  HayAviso: boolean;
  Campana?: string | null;
  /** Ya redactado (de usted), sin la pregunta final. */
  Mensaje?: string | null;
  Productos?: ProductoCampanaSoloEnStock[] | null;
}

/** Lo que viaja en PedidoVentaDTO.CampanaSoloEnStock. Sin elección no se manda el campo. */
export type EleccionCampanaSoloEnStock = 'QuitarDescuento' | 'MantenerDescuento';

export const TITULO_CAMPANA_SOLO_EN_STOCK = 'Oferta solo para lo que hay en stock';

export const PREGUNTA_CAMPANA_SOLO_EN_STOCK =
  '¿Quitar el descuento de la campaña a lo que no hay en stock? Si responde No, irá todo con descuento aunque no haya stock.';

/** Tipos de aviso que devuelve la API tras guardar (AvisosGrabacion al crear, Avisos al modificar). */
export const AVISO_CAMPANA_SOLO_EN_STOCK = 'CampanaSoloEnStock';
export const AVISO_CAMPANA_SOLO_EN_STOCK_APLICADO = 'CampanaSoloEnStockAplicado';

export interface AvisoGrabacionPedido {
  Tipo?: string;
  Mensaje?: string;
  Datos?: any;
}

/** Hay que preguntar solo si la API lo dice y trae qué contar. */
export function hayQuePreguntarCampanaSoloEnStock(aviso: AvisoCampanaSoloEnStock | null | undefined): boolean {
  return !!aviso && aviso.HayAviso === true && !!(aviso.Mensaje || '').trim();
}

/** El texto del diálogo: lo que falta de cada producto, una línea en blanco y la pregunta. */
export function textoPreguntaCampanaSoloEnStock(aviso: AvisoCampanaSoloEnStock): string {
  return `${(aviso.Mensaje || '').trim()}\n\n${PREGUNTA_CAMPANA_SOLO_EN_STOCK}`;
}

/**
 * Los mensajes de la campaña que hay que enseñar tras guardar (el pedido ya está guardado: no bloquea).
 * Los tipos que la app no conoce se ignoran. Acepta las claves en PascalCase o camelCase.
 */
export function mensajesCampanaSoloEnStock(avisos: any[] | null | undefined): string[] {
  return (avisos || [])
    .filter(a => {
      const tipo = a?.Tipo ?? a?.tipo;
      return tipo === AVISO_CAMPANA_SOLO_EN_STOCK || tipo === AVISO_CAMPANA_SOLO_EN_STOCK_APLICADO;
    })
    .map(a => ((a?.Mensaje ?? a?.mensaje) || '').trim())
    .filter(m => !!m);
}

/** Con «QuitarDescuento» la API parte líneas: tras guardar hay que volver a leer el pedido. */
export function hayQueRecargarPorCampana(avisos: any[] | null | undefined): boolean {
  return (avisos || []).some(a => (a?.Tipo ?? a?.tipo) === AVISO_CAMPANA_SOLO_EN_STOCK_APLICADO);
}

/**
 * Al MODIFICAR solo se consulta si ESE guardado añade alguna línea de producto nueva o sube la cantidad de
 * alguna que ya estaba, respecto al pedido tal como se cargó o se guardó la última vez (como Nesto).
 * Las líneas se identifican por su Nº de orden (`id`); una línea de producto es tipoLinea 1.
 */
export function cambioQueImportaAlStockDeCampana(lineasAhora: any[] | null | undefined,
  lineasAlCargar: any[] | null | undefined): boolean {
  const deProducto = (l: any) => l && (l.tipoLinea === 1 || l.tipoLinea === '1') && !!(l.Producto ?? l.producto);
  const antes = new Map<number, number>();
  (lineasAlCargar || []).filter(deProducto).forEach(l => antes.set(Number(l.id), Number(l.Cantidad ?? l.cantidad) || 0));
  return (lineasAhora || []).filter(deProducto).some(l => {
    const id = Number(l.id) || 0;
    if (!id || !antes.has(id)) {
      return true;
    }
    return (Number(l.Cantidad ?? l.cantidad) || 0) > (antes.get(id) as number);
  });
}
