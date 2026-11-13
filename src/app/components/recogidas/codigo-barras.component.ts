import { AfterViewInit, Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import * as JsBarcodeModulo from 'jsbarcode';

/** JsBarcode es CommonJS (`export =`): según el empaquetador llega la función o un módulo con `default`. */
const JsBarcode: any = (JsBarcodeModulo as any).default || JsBarcodeModulo;

/**
 * NestoApp#259 (NestoAPI#855): el código NR de una recogida «la recojo yo» como Code128, para que lo lean en Algete al llegar.
 * Siempre negro sobre blanco (también en modo oscuro): el lector necesita el contraste.
 */
@Component({
  selector: 'codigo-barras',
  template: '<div class="codigo-barras"><svg #svg role="img" [attr.aria-label]="\'Código de barras \' + valor"></svg></div>',
  styles: ['.codigo-barras { background: #ffffff; padding: 8px; border-radius: 4px; text-align: center; } svg { max-width: 100%; height: auto; }'],
  standalone: false
})
export class CodigoBarrasComponent implements AfterViewInit, OnChanges {
  @Input() valor: string = '';
  @ViewChild('svg', { static: true }) svg: ElementRef<SVGElement>;

  ngAfterViewInit(): void {
    this.pintar();
  }

  ngOnChanges(): void {
    this.pintar();
  }

  private pintar(): void {
    const valor = (this.valor || '').trim();
    if (!this.svg?.nativeElement || !valor) {
      return;
    }
    JsBarcode(this.svg.nativeElement, valor, {
      format: 'CODE128', width: 2, height: 90, margin: 10, displayValue: true, fontSize: 18,
      background: '#ffffff', lineColor: '#000000'
    });
  }
}
