import { Pipe, PipeTransform } from '@angular/core';
import { formatCurrency } from '@angular/common';

export const SIN_LIMITE_TRAMO = -1;

@Pipe({ name: 'importeOTexto' })
export class ImporteOTextoPipe implements PipeTransform {
  transform(valor: number | null | undefined, textoFallback: string, locale = 'es'): string {
    if (valor === null || valor === undefined) {
      return '';
    }
    if (valor === SIN_LIMITE_TRAMO) {
      return textoFallback;
    }
    return formatCurrency(valor, locale, '€', 'EUR');
  }
}
