export interface CCC {
  numero: string;
  pais: string;
  entidad: string;
  oficina: string;
  bic: string;
  estado: number;
  tipoMandato?: number;
  fechaMandato?: Date;
  ibanFormateado: string;
  nombreEntidad: string;
  descripcion: string;
}

export const CCC_SIN_CCC: CCC = {
  numero: '',
  pais: '',
  entidad: '',
  oficina: '',
  bic: '',
  estado: 0,
  ibanFormateado: '',
  nombreEntidad: '',
  descripcion: '(Sin CCC)'
};
