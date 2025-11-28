export interface PlazoPago {
  plazoPago: string;
  descripcion: string;
}

export interface InfoDeudaCliente {
  tieneDeudaVencida: boolean;
  importeDeudaVencida?: number;
  diasVencimiento?: number;
  tieneImpagados: boolean;
  importeImpagados?: number;
  motivoRestriccion: string;
}

export interface PlazosPagoResponse {
  plazosPago: PlazoPago[];
  infoDeuda: InfoDeudaCliente;
}
