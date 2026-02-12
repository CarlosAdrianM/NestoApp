import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { secrets } from '../../environments/secrets';

const IMAGEN_POR_DEFECTO = 'https://www.productosdeesteticaypeluqueriaprofesional.com/img/p/es-default-home_default.jpg';

@Injectable({
  providedIn: 'root'
})
export class PrestashopService {

  private imageCache: Map<string, string> = new Map();
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(private http: HttpClient) {
    this.apiKey = secrets.prestashop.apiKey;
    this.baseUrl = secrets.prestashop.baseUrl;
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

      const url = `${this.baseUrl}/api/products?filter[reference]=${encodeURIComponent(referencia)}&display=full`;
      const response = await this.http.get(url, { headers, responseType: 'text' }).toPromise();

      const parser = new DOMParser();
      const doc = parser.parseFromString(response, 'text/xml');

      const products = doc.getElementsByTagName('product');
      if (products.length === 0) {
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

      const imageUrl = `${this.baseUrl}/${imageId}-small_default/${encodeURIComponent(linkRewrite)}.jpg`;
      this.imageCache.set(referencia, imageUrl);

      return imageUrl;
    } catch (error) {
      console.error(`Error obteniendo imagen para ${referencia}:`, error);
      return IMAGEN_POR_DEFECTO;
    }
  }
}
