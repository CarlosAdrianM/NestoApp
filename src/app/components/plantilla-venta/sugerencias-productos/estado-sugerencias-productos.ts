import { firstValueFrom } from 'rxjs';
import { SugerenciasProductosService } from 'src/app/services/sugerencias-productos.service';
import {
  ProductoCarritoSugerencia, RespuestaSugerencia, SugerenciaProducto,
  carritoParaSugerencias, huellaSugerenciasProductos, sugerenciasVisibles
} from 'src/app/models/sugerencias-productos.model';

/** Lo que la plantilla sabe del pedido en cada momento (null = todavía no hay cliente). */
export interface DatosSugerenciasProductos {
  empresa: string;
  cliente: string;
  contacto: string;
  vendedor: string;
  lineas: any[];
}

/**
 * NestoApp#235: el estado de las sugerencias de una plantilla. Pregunta a la API con retardo (como
 * Nesto, 1 s) y solo si cambian el cliente, el contacto o los productos del pedido. Las respuestas
 * que llegan tarde (de otro cliente o de un pedido que ya ha cambiado) se descartan.
 */
export class EstadoSugerenciasProductos {
  static readonly RETARDO_MS = 1000;

  public idSesion: string | null = null;
  public sugerencias: SugerenciaProducto[] = [];

  private huella = '';
  private clienteActual = '';
  private carrito: ProductoCarritoSugerencia[] = [];
  private peticion = 0;
  private temporizador: any = null;

  constructor(
    private servicio: SugerenciasProductosService,
    private datos: () => DatosSugerenciasProductos | null,
    private retardoMs: number = EstadoSugerenciasProductos.RETARDO_MS
  ) { }

  public programar(): void {
    this.cancelar();
    this.temporizador = setTimeout(() => {
      this.temporizador = null;
      this.calcularYa();
    }, this.retardoMs);
  }

  public cancelar(): void {
    if (this.temporizador) {
      clearTimeout(this.temporizador);
      this.temporizador = null;
    }
  }

  public calcularYa(): void {
    const datos = this.datos();
    if (!datos?.cliente) {
      this.reiniciar();
      return;
    }
    const cliente = `${(datos.empresa || '').trim()}|${datos.cliente.trim()}`;
    if (cliente !== this.clienteActual) {
      // Otro cliente: sesión nueva y fuera las del anterior.
      this.reiniciar();
      this.clienteActual = cliente;
    }
    this.carrito = carritoParaSugerencias(datos.lineas);
    const huella = huellaSugerenciasProductos(datos.empresa, datos.cliente, datos.contacto, this.carrito);
    if (huella === this.huella) {
      return;
    }
    this.huella = huella;
    const peticion = ++this.peticion;
    this.servicio.calcular({
      Empresa: (datos.empresa || '').trim(),
      Cliente: datos.cliente.trim(),
      Contacto: (datos.contacto || '').trim(),
      Vendedor: (datos.vendedor || '').trim(),
      IdSesion: this.idSesion,
      Aplicacion: 'NestoApp',
      Productos: this.carrito
    }).subscribe(respuesta => {
      if (peticion !== this.peticion) {
        return;
      }
      if (!respuesta) {
        this.sugerencias = [];
        this.huella = ''; // que se vuelva a intentar en el próximo cambio
        return;
      }
      this.idSesion = respuesta.IdSesion || this.idSesion;
      this.sugerencias = sugerenciasVisibles(respuesta.Sugerencias, this.carrito);
    });
  }

  /**
   * Quita la tarjeta al momento. Con «No le interesa» o «Quitar» la API devuelve otra para el mismo
   * hueco, que se pone en su lugar si no está ya a la vista ni en el pedido.
   */
  public async responder(sugerencia: SugerenciaProducto, respuesta: RespuestaSugerencia): Promise<void> {
    this.sugerencias = this.sugerencias.filter(s => s !== sugerencia);
    const resultado = await firstValueFrom(this.servicio.responder(sugerencia.IdSugerencia, respuesta, this.carrito));
    const sustituta = resultado?.Sustituta;
    if (!sustituta || respuesta === 'Anadido') {
      return;
    }
    const conSustituta = [...this.sugerencias, { ...sustituta, Posicion: sustituta.Posicion || sugerencia.Posicion }];
    const yaEsta = this.sugerencias.some(s => (s.Producto || '').trim() === (sustituta.Producto || '').trim());
    if (!yaEsta) {
      this.sugerencias = sugerenciasVisibles(conSustituta, this.carrito);
    }
  }

  private reiniciar(): void {
    this.peticion++;
    this.idSesion = null;
    this.sugerencias = [];
    this.huella = '';
    this.clienteActual = '';
    this.carrito = [];
  }
}
