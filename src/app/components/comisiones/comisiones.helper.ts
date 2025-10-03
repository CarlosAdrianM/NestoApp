import { IEtiquetaComisionAcumulada, ResumenComisionesMes } from './comisiones.interfaces';

export class ComisionesHelper {
  /**
   * Obtiene la etiqueta "General" del resumen
   * Esta es la etiqueta principal que contiene la información acumulada
   */
  static obtenerEtiquetaGeneral(resumen: ResumenComisionesMes): IEtiquetaComisionAcumulada | undefined {
    if (!resumen || !resumen.Etiquetas) {
      return undefined;
    }
    
    const etiqueta = resumen.Etiquetas.find(e => e.Nombre === 'General');
    
    // Verificamos que sea una etiqueta acumulada
    if (etiqueta && (etiqueta as IEtiquetaComisionAcumulada).EsComisionAcumulada) {
      return etiqueta as IEtiquetaComisionAcumulada;
    }
    
    return undefined;
  }

  /**
   * Formatea un valor monetario
   * useGrouping: true fuerza el uso del separador de miles incluso para números pequeños
   */
  static formatCurrency(value: number | undefined | null): string {
    if (value === undefined || value === null) {
      return 'N/A';
    }
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true  // Forzar separador de miles
    }).format(value);
  }

  /**
   * Formatea un número con separador de miles
   * useGrouping: true fuerza el uso del separador de miles incluso para números pequeños
   */
  static formatNumber(value: number | undefined | null, decimals: number = 2): string {
    if (value === undefined || value === null) {
      return 'N/A';
    }
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: true  // Forzar separador de miles
    }).format(value);
  }

  /**
   * Formatea un porcentaje
   */
  static formatPercent(value: number | undefined | null, decimals: number = 2): string {
    if (value === undefined || value === null) {
      return 'N/A';
    }
    return new Intl.NumberFormat('es-ES', { 
      style: 'percent', 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  }
}