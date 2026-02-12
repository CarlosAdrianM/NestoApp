import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

const IMAGEN_POR_DEFECTO = 'https://www.productosdeesteticaypeluqueriaprofesional.com/img/p/es-default-home_default.jpg';

@Injectable({
  providedIn: 'root'
})
export class PrestashopService {

  private imageCache: Map<string, string> = new Map();
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(private http: HttpClient) {
    this.apiKey = environment.prestashop.apiKey;
    this.baseUrl = environment.prestashop.baseUrl;
  }

  /**
   * URL base para las llamadas API.
   * En desarrollo (ionic serve) usa el proxy de Angular para evitar CORS.
   * En producción (dispositivo Capacitor) llama directamente a Prestashop.
   */
  private get apiBaseUrl(): string {
    return environment.production ? this.baseUrl : '/prestashop-api';
  }

  public async obtenerUrlImagen(referencia: string): Promise<string> {
    if (this.imageCache.has(referencia)) {
      return this.imageCache.get(referencia);
    }

    if (!this.apiKey || !this.baseUrl) {
      return IMAGEN_POR_DEFECTO;
    }

    try {
      const headers = new HttpHeaders({
        'Authorization': 'Basic ' + btoa(this.apiKey + ':')
      });

      const url = `${this.apiBaseUrl}/api/products?filter[reference]=${encodeURIComponent(referencia)}&display=full`;
      const response = await this.http.get(url, { headers, responseType: 'text' }).toPromise();

      const parser = new DOMParser();
      const doc = parser.parseFromString(response, 'text/xml');

      const products = doc.getElementsByTagName('product');
      if (products.length === 0) {
        this.imageCache.set(referencia, IMAGEN_POR_DEFECTO);
        return IMAGEN_POR_DEFECTO;
      }

      const product = products[0];

      // Buscar la primera imagen (dentro de associations > images > image > id)
      const images = product.getElementsByTagName('image');
      if (images.length === 0) {
        this.imageCache.set(referencia, IMAGEN_POR_DEFECTO);
        return IMAGEN_POR_DEFECTO;
      }

      // El primer <image> contiene un <id> con el ID de la imagen
      const imageIdElement = images[0].getElementsByTagName('id');
      if (imageIdElement.length === 0) {
        this.imageCache.set(referencia, IMAGEN_POR_DEFECTO);
        return IMAGEN_POR_DEFECTO;
      }
      const imageId = imageIdElement[0].textContent;

      // Obtener link_rewrite (puede tener un hijo <language>)
      const linkRewriteElements = product.getElementsByTagName('link_rewrite');
      const linkRewrite = linkRewriteElements.length > 0 ? linkRewriteElements[0].textContent : '';

      // La URL de la imagen siempre apunta a Prestashop directamente (es pública, no necesita auth)
      const imageUrl = `${this.baseUrl}/${imageId}-small_default/${encodeURIComponent(linkRewrite)}.jpg`;
      this.imageCache.set(referencia, imageUrl);

      return imageUrl;
    } catch (error) {
      console.error(`Error obteniendo imagen para ${referencia}:`, error);
      return IMAGEN_POR_DEFECTO;
    }
  }
}
