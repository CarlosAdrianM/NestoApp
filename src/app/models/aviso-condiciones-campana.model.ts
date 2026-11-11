/**
 * NestoApp#275 (gemela de Nesto, feria online 12-16/11/26): las ofertas de algunas campañas exigen pago al contado. La
 * regla la decide NestoAPI (POST api/PedidosVenta/AvisoCondicionesCampana, solo lectura); la app solo pregunta al CREAR
 * un pedido o presupuesto y, con «Sí», cambia los plazos. Nunca impide crear. PascalCase, como lo serializa NestoAPI.
 */
export interface PeticionAvisoCondicionesCampana {
  Empresa: string;
  Productos: string[];
  FormaPago: string | null;
  PlazosPago: string | null;
  TienePrepago: boolean;
  /** Un pedido con pronto pago cuenta como al contado (la plantilla no lo lleva: 0). */
  DescuentoPP: number;
}

export interface AvisoCondicionesCampana {
  Avisar: boolean;
  /** De usted y con la pregunta ya hecha («…¿Cambiar a contado?»). */
  Mensaje?: string | null;
  PlazosPagoPropuestos?: string | null;
  Campana?: string | null;
  Productos?: string[];
}

/** Lo que se le pregunta a la API a partir del pedido que se va a crear (el de la plantilla, antes del POST). */
export function peticionAvisoCondicionesCampana(pedido: any, tienePrepago: boolean = false): PeticionAvisoCondicionesCampana | null {
  const productos: string[] = [];
  for (const linea of (pedido?.Lineas || [])) {
    const producto = (linea?.producto ?? linea?.Producto ?? '').toString().trim();
    if (producto && !productos.includes(producto)) {
      productos.push(producto);
    }
  }
  if (!pedido || productos.length === 0) {
    return null;
  }
  return {
    Empresa: (pedido.empresa || '1').toString().trim() || '1',
    Productos: productos,
    FormaPago: (pedido.formaPago || '').toString().trim() || null,
    PlazosPago: (pedido.plazosPago || '').toString().trim() || null,
    TienePrepago: !!tienePrepago,
    DescuentoPP: +pedido.DescuentoPP || +pedido.descuentoPP || 0
  };
}

/** Hay que preguntar: la API dice que avise, trae el texto y unos plazos que proponer. */
export function hayQueAvisarCondicionesCampana(aviso: AvisoCondicionesCampana | null | undefined): boolean {
  return !!aviso && aviso.Avisar === true && !!(aviso.Mensaje || '').trim() && !!(aviso.PlazosPagoPropuestos || '').trim();
}
