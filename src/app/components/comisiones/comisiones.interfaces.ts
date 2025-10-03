/**
 * Interfaces para el sistema de comisiones
 * Basadas en la refactorización de la API de Septiembre 2025
 */

export interface IEtiquetaComision {
    $id?: string;
    Nombre: string;
    Comision: number;
    Tipo: number;
    
    // Propiedades anuales (nuevas en la refactorización)
    CifraAnual?: number;
    ComisionAnual?: number;
    PorcentajeAnual?: number;
    UnidadCifra?: string;
  }
  
  export interface IEtiquetaComisionVenta extends IEtiquetaComision {
    Venta?: number;
    SumaEnTotalVenta?: boolean;
  }
  
  export interface IEtiquetaComisionRecuento extends IEtiquetaComision {
    Recuento?: number;
    UnidadCifra: string; // Para recuentos siempre es "clientes" u otra unidad
  }
  
  export interface IEtiquetaComisionAcumulada extends IEtiquetaComisionVenta {
    EsComisionAcumulada: boolean;
    
    // Propiedades de tramos y proyección
    FaltaParaSalto?: number;
    InicioTramo?: number;
    FinalTramo?: number;
    BajaSaltoMesSiguiente?: boolean;
    Proyeccion?: number;
    
    // Propiedades acumuladas del año
    VentaAcumulada?: number;
    ComisionAcumulada?: number;
    TipoConseguido?: number;
    TipoReal?: number;
    
    // Propiedades de ajuste de comisión por cambio de tramo
    ComisionRecuperadaEsteMes?: number;
    TextoSobrepago?: string;
    
    // Propiedades de estrategias especiales (nuevas en la refactorización)
    EstrategiaUtilizada?: string;
    TipoCorrespondePorTramo?: number;
    TipoRealmenteAplicado?: number;
    MotivoEstrategia?: string;
    ComisionSinEstrategia?: number;
    TieneEstrategiaEspecial?: boolean;
    EsSobrepago?: boolean;
  }
  
  // Type guard para detectar qué tipo de etiqueta es
  export function esEtiquetaVenta(etiqueta: IEtiquetaComision): etiqueta is IEtiquetaComisionVenta {
    return (etiqueta as IEtiquetaComisionVenta).Venta !== undefined;
  }
  
  export function esEtiquetaRecuento(etiqueta: IEtiquetaComision): etiqueta is IEtiquetaComisionRecuento {
    return (etiqueta as IEtiquetaComisionRecuento).Recuento !== undefined;
  }
  
  export function esEtiquetaAcumulada(etiqueta: IEtiquetaComision): etiqueta is IEtiquetaComisionAcumulada {
    return (etiqueta as IEtiquetaComisionAcumulada).EsComisionAcumulada === true;
  }
  
  export interface ResumenComisionesMes {
    $id?: string;
    Vendedor: string;
    Anno: number;
    Mes: number;
    Etiquetas: IEtiquetaComision[];
    
    // Campos del nivel de resumen (totales)
    TotalComisiones: number;
    TotalVentaAcumulada?: number;
    TotalComisionAcumulada?: number;
    TotalTipoAcumulado?: number;
    
    // ========================================
    // CAMPOS OBSOLETOS (mantener por compatibilidad)
    // Estos campos se mantienen en la API pero ahora están dentro de la etiqueta "General"
    // ========================================
    
    /** @deprecated Usar etiquetaGeneral.FaltaParaSalto */
    GeneralFaltaParaSalto?: number;
    
    /** @deprecated Usar etiquetaGeneral.InicioTramo */
    GeneralInicioTramo?: number;
    
    /** @deprecated Usar etiquetaGeneral.FinalTramo */
    GeneralFinalTramo?: number;
    
    /** @deprecated Usar etiquetaGeneral.BajaSaltoMesSiguiente */
    GeneralBajaSaltoMesSiguiente?: boolean;
    
    /** @deprecated Usar etiquetaGeneral.Proyeccion */
    GeneralProyeccion?: number;
    
    /** @deprecated Usar etiquetaGeneral.VentaAcumulada */
    GeneralVentaAcumulada?: number;
    
    /** @deprecated Usar etiquetaGeneral.ComisionAcumulada */
    GeneralComisionAcumulada?: number;
    
    /** @deprecated Usar etiquetaGeneral.TipoConseguido */
    GeneralTipoConseguido?: number;
    
    /** @deprecated Usar etiquetaGeneral.TipoReal */
    GeneralTipoReal?: number;
    
    /** @deprecated Usar etiquetaGeneral.EstrategiaUtilizada */
    EstrategiaUtilizada?: string;
    
    /** @deprecated Usar etiquetaGeneral.TipoCorrespondePorTramo */
    GeneralTipoCorrespondePorTramo?: number;
    
    /** @deprecated Usar etiquetaGeneral.TipoRealmenteAplicado */
    GeneralTipoRealmenteAplicado?: number;
    
    /** @deprecated Usar etiquetaGeneral.MotivoEstrategia */
    MotivoEstrategia?: string;
    
    /** @deprecated Usar etiquetaGeneral.ComisionSinEstrategia */
    GeneralComisionSinEstrategia?: number;
    
    /** @deprecated Usar etiquetaGeneral.TieneEstrategiaEspecial */
    TieneEstrategiaEspecial?: boolean;
    
    /** @deprecated Usar etiquetaGeneral.EsSobrepago */
    EsSobrepago?: boolean;
  }