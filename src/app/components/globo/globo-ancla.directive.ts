import { Directive, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { GlobosService } from 'src/app/services/globos.service';

/**
 * Marca el control junto al que sale un globo (NestoAPI#774): `<ion-button globoAncla="pedido-venta.PagarAPlazos">`.
 * Equivale al `Globo.Ancla` de Nesto. La clave es «<ruta>.<Control>» y tiene que coincidir con la de scripts/Globos_*.sql.
 */
@Directive({
  selector: '[globoAncla]',
  standalone: false
})
export class GloboAnclaDirective implements OnChanges, OnDestroy {
  @Input() globoAncla: string;
  private registrada: string | null = null;

  constructor(private elemento: ElementRef<HTMLElement>, private globos: GlobosService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.globoAncla) {
      this.quitar();
      this.registrada = (this.globoAncla || '').trim() || null;
      if (this.registrada) {
        this.globos.registrarAncla(this.registrada, this.elemento.nativeElement);
      }
    }
  }

  ngOnDestroy(): void {
    this.quitar();
  }

  private quitar(): void {
    if (this.registrada) {
      this.globos.quitarAncla(this.registrada, this.elemento.nativeElement);
      this.registrada = null;
    }
  }
}
