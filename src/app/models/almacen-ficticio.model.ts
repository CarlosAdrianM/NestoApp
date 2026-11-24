/**
 * NestoApp#292 (gemela de NestoAPI#894): «Mi almacén», lo que el vendedor tiene en su almacén ficticio (IF, AB, IM…).
 * Solo consulta: meter y sacar lo hacen Almacén y las tiendas desde Nesto. El jefe de equipo ve también los de su equipo.
 * GET api/AlmacenesFicticios y GET api/AlmacenesFicticios/{codigo}/Existencias. PascalCase, como lo serializa NestoAPI.
 */
export interface AlmacenFicticio {
  Codigo: string;
  Descripcion?: string | null;
  /** Vendedor, SoloAlmacen, Amazon u Otro. */
  Tipo?: string | null;
  EsDeVendedor?: boolean;
  Vendedores?: string[] | null;
  /** Es el del propio usuario (sale el primero). */
  EsSuyo?: boolean;
  PuedeTraspasar?: boolean;
  AlmacenContra?: string | null;
  MotivoNoPuedeTraspasar?: string | null;
  PermiteNegativo?: boolean;
}

/** Un producto con saldo distinto de 0 (puede ser negativo si el almacén lo permite). Sin costes ni precios. */
export interface ExistenciaAlmacenFicticio {
  Producto: string;
  Nombre?: string | null;
  Familia?: string | null;
  NombreFamilia?: string | null;
  Unidades: number;
}

export interface ExistenciasAlmacenFicticio {
  Almacen: string;
  Descripcion?: string | null;
  Productos: ExistenciaAlmacenFicticio[];
  NumeroProductos?: number;
  TotalUnidades?: number;
}

export interface GrupoFamiliaAlmacenFicticio {
  familia: string;
  nombre: string;
  unidades: number;
  productos: ExistenciaAlmacenFicticio[];
}

export const TEXTO_SIN_ALMACEN_FICTICIO = 'No tiene almacén asignado.';
const SIN_FAMILIA = 'Sin familia';

const limpio = (texto: any) => (texto ?? '').toString().trim();
/** Sin mayúsculas ni tildes, para buscar. */
const plano = (texto: any) => limpio(texto).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** El almacén que se enseña al entrar: el suyo; si no tiene (jefe de equipo, Dirección), el primero. Null si no ve ninguno. */
export function almacenPorDefecto(almacenes: AlmacenFicticio[] | null | undefined): AlmacenFicticio | null {
  const lista = (almacenes || []).filter(a => !!limpio(a?.Codigo));
  return lista.find(a => a.EsSuyo === true) || lista[0] || null;
}

/** «IF · Israel Fernández»; el suyo, con «(el suyo)» detrás. */
export function textoAlmacenFicticio(almacen: AlmacenFicticio | null | undefined): string {
  if (!almacen) {
    return '';
  }
  const descripcion = limpio(almacen.Descripcion);
  const nombre = descripcion ? `${limpio(almacen.Codigo)} · ${descripcion}` : limpio(almacen.Codigo);
  return almacen.EsSuyo ? `${nombre} (el suyo)` : nombre;
}

/** Busca por referencia o por nombre (todas las palabras, sin mayúsculas ni tildes). Sin texto, todos. */
export function filtrarExistencias(productos: ExistenciaAlmacenFicticio[] | null | undefined, texto: string | null | undefined): ExistenciaAlmacenFicticio[] {
  const palabras = plano(texto).split(/\s+/).filter(p => !!p);
  const lista = (productos || []).filter(p => !!p);
  if (palabras.length === 0) {
    return lista;
  }
  return lista.filter(p => {
    const donde = `${plano(p.Producto)} ${plano(p.Nombre)} ${plano(p.NombreFamilia)}`;
    return palabras.every(palabra => donde.includes(palabra));
  });
}

/** Por familia (orden alfabético, «Sin familia» al final) y, dentro, por nombre. */
export function agruparPorFamilia(productos: ExistenciaAlmacenFicticio[] | null | undefined): GrupoFamiliaAlmacenFicticio[] {
  const grupos = new Map<string, GrupoFamiliaAlmacenFicticio>();
  for (const producto of (productos || []).filter(p => !!p)) {
    const familia = limpio(producto.Familia);
    const nombre = limpio(producto.NombreFamilia) || familia || SIN_FAMILIA;
    const clave = familia || nombre;
    if (!grupos.has(clave)) {
      grupos.set(clave, { familia, nombre, unidades: 0, productos: [] });
    }
    const grupo = grupos.get(clave) as GrupoFamiliaAlmacenFicticio;
    grupo.productos.push(producto);
    grupo.unidades += Number(producto.Unidades) || 0;
  }
  const lista = Array.from(grupos.values());
  lista.forEach(g => g.productos.sort((a, b) => limpio(a.Nombre).localeCompare(limpio(b.Nombre), 'es') || limpio(a.Producto).localeCompare(limpio(b.Producto))));
  return lista.sort((a, b) => {
    const sa = a.nombre === SIN_FAMILIA ? 1 : 0;
    const sb = b.nombre === SIN_FAMILIA ? 1 : 0;
    return sa !== sb ? sa - sb : a.nombre.localeCompare(b.nombre, 'es');
  });
}

export function totalUnidades(productos: ExistenciaAlmacenFicticio[] | null | undefined): number {
  return (productos || []).reduce((suma, p) => suma + (Number(p?.Unidades) || 0), 0);
}

/** «3 productos · 12 unidades» (en singular cuando toca). */
export function textoResumenExistencias(numeroProductos: number, unidades: number): string {
  const n = Number(numeroProductos) || 0;
  const u = Number(unidades) || 0;
  return `${n} ${n === 1 ? 'producto' : 'productos'} · ${u} ${Math.abs(u) === 1 ? 'unidad' : 'unidades'}`;
}
