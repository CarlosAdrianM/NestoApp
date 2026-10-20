/**
 * NestoApp#235 (NestoAPI#670, Nesto#537): productos que el vendedor puede ofrecer al cliente en la
 * plantilla. Toda la lógica (qué se sugiere y por qué) es de la API; aquí solo se pintan, se
 * contestan y se enlaza la sesión con el pedido. Campos en PascalCase, como los serializa NestoAPI.
 */
export interface ProductoCarritoSugerencia {
  Producto: string;
  Cantidad: number;
}

export interface CalcularSugerenciasProductos {
  Empresa: string;
  Cliente: string;
  Contacto: string;
  Vendedor: string;
  /** null = sesión nueva. */
  IdSesion: string | null;
  Aplicacion: 'NestoApp';
  Productos: ProductoCarritoSugerencia[];
}

export interface SugerenciaProducto {
  IdSugerencia: number;
  Producto: string;
  Nombre: string;
  /** CompradoJunto | LeToca | Potenciar | Parecidos */
  Motivo: string;
  /** La frase que el vendedor le puede decir al cliente. */
  Texto: string;
  /** El hueco (1..4). */
  Posicion: number;
  UrlFoto?: string | null;
  Tamano?: number | null;
  UnidadMedida?: string | null;
  Familia?: string | null;
  NombreConTamano?: string | null;
}

export interface SugerenciasProductos {
  IdSesion: string;
  Sugerencias: SugerenciaProducto[];
}

export type RespuestaSugerencia = 'Anadido' | 'NoLeInteresa' | 'DescartadoVendedor';

export interface ResultadoRespuestaSugerencia {
  IdSugerencia: number;
  Respuesta: string;
  /** La que sale en su lugar (null si no hay o si se ha añadido). */
  Sustituta?: SugerenciaProducto | null;
  Sugerencias?: SugerenciaProducto[];
}

/** Como en la plantilla de Nesto: se enseñan hasta 3. */
export const MAXIMO_SUGERENCIAS_PRODUCTOS = 3;

const MOTIVOS: { [motivo: string]: { icono: string; etiqueta: string } } = {
  CompradoJunto: { icono: '🔗', etiqueta: 'Va con lo que lleva' },
  LeToca: { icono: '🔁', etiqueta: 'Ya le toca' },
  Potenciar: { icono: '⭐', etiqueta: 'A potenciar' },
  Parecidos: { icono: '👥', etiqueta: 'Clientes parecidos' }
};

export function etiquetaMotivo(motivo: string): string {
  const m = MOTIVOS[motivo] || { icono: '💡', etiqueta: 'Sugerencia' };
  return `${m.icono} ${m.etiqueta}`;
}

export function nombreSugerencia(s: SugerenciaProducto): string {
  return (s?.NombreConTamano || s?.Nombre || s?.Producto || '').trim();
}

export function productoYFamilia(s: SugerenciaProducto): string {
  return [(s?.Producto || '').trim(), (s?.Familia || '').trim()].filter(t => !!t).join(' · ');
}

const limpiar = (valor: any): string => (valor ?? '').toString().trim();

/**
 * Lo que decide si hay que volver a preguntar: cambiar una cantidad no; añadir o quitar un
 * producto, o cambiar de cliente o de contacto, sí.
 */
export function huellaSugerenciasProductos(empresa: string, cliente: string, contacto: string, productos: ProductoCarritoSugerencia[]): string {
  const codigos = (productos || []).map(p => limpiar(p.Producto)).filter(p => !!p).sort();
  return [limpiar(empresa), limpiar(cliente), limpiar(contacto), codigos.join(',')].join('|');
}

/** Las líneas del pedido agrupadas por producto (cobradas + de regalo), como en Nesto. */
export function carritoParaSugerencias(lineas: any[] | null | undefined): ProductoCarritoSugerencia[] {
  const porProducto = new Map<string, number>();
  for (const l of lineas || []) {
    const producto = limpiar(l?.producto);
    const unidades = (+l?.cantidad || 0) + (+l?.cantidadOferta || 0);
    if (producto && unidades > 0) {
      porProducto.set(producto, (porProducto.get(producto) || 0) + unidades);
    }
  }
  return [...porProducto.entries()].map(([Producto, Cantidad]) => ({ Producto, Cantidad }));
}

/** Las que se enseñan: por hueco, sin las que ya están en el pedido, hasta el máximo. */
export function sugerenciasVisibles(sugerencias: SugerenciaProducto[], enCarrito: ProductoCarritoSugerencia[]): SugerenciaProducto[] {
  const productos = new Set((enCarrito || []).map(p => limpiar(p.Producto)));
  return [...(sugerencias || [])]
    .filter(s => !!s && !productos.has(limpiar(s.Producto)))
    .sort((a, b) => (a.Posicion || 0) - (b.Posicion || 0))
    .slice(0, MAXIMO_SUGERENCIAS_PRODUCTOS);
}
