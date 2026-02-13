import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HTTP } from '@ionic-native/http/ngx';
import { environment } from '../../environments/environment';

const IMAGEN_POR_DEFECTO = 'https://www.productosdeesteticaypeluqueriaprofesional.com/img/p/es-default-home_default.jpg';

@Injectable({
  providedIn: 'root'
})
export class PrestashopService {

  private imageCache: Map<string, string> = new Map();
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(
    private http: HttpClient,
    private nativeHttp: HTTP
  ) {
    this.apiKey = environment.prestashop.apiKey;
    this.baseUrl = environment.prestashop.baseUrl;
  }

  public async obtenerUrlImagen(referencia: string): Promise<string> {
    if (this.imageCache.has(referencia)) {
      return this.imageCache.get(referencia);
    }

    if (!this.apiKey || !this.baseUrl) {
      return IMAGEN_POR_DEFECTO;
    }

    try {
      const url = `${this.baseUrl}/api/products?filter[reference]=${encodeURIComponent(referencia)}&display=full`;
      const response = environment.production
        ? await this.fetchNativo(url)
        : await this.fetchProxy(url);

      return this.parsearImagenDeXml(referencia, response);
    } catch (error) {
      console.error(`Error obteniendo imagen para ${referencia}:`, error);
      return IMAGEN_POR_DEFECTO;
    }
  }

  /**
   * En producción: HTTP nativo (Cordova) → sin CORS
   */
  private async fetchNativo(url: string): Promise<string> {
    this.nativeHttp.setDataSerializer('utf8');
    const response = await this.nativeHttp.get(
      url,
      {},
      { 'Authorization': 'Basic ' + btoa(this.apiKey + ':') }
    );
    return response.data;
  }

  /**
   * En desarrollo: Angular HttpClient con proxy → sin CORS
   */
  private async fetchProxy(url: string): Promise<string> {
    const proxyUrl = url.replace(this.baseUrl, '/prestashop-api');
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa(this.apiKey + ':')
    });
    return this.http.get(proxyUrl, { headers, responseType: 'text' }).toPromise();
  }

  /**
   * Parsea el XML de Prestashop y extrae la URL de la imagen
   */
  private parsearImagenDeXml(referencia: string, xml: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');

    const products = doc.getElementsByTagName('product');
    if (products.length === 0) {
      this.imageCache.set(referencia, IMAGEN_POR_DEFECTO);
      return IMAGEN_POR_DEFECTO;
    }

    const product = products[0];

    const images = product.getElementsByTagName('image');
    if (images.length === 0) {
      this.imageCache.set(referencia, IMAGEN_POR_DEFECTO);
      return IMAGEN_POR_DEFECTO;
    }

    const imageIdElement = images[0].getElementsByTagName('id');
    if (imageIdElement.length === 0) {
      this.imageCache.set(referencia, IMAGEN_POR_DEFECTO);
      return IMAGEN_POR_DEFECTO;
    }
    const imageId = imageIdElement[0].textContent;

    const linkRewriteElements = product.getElementsByTagName('link_rewrite');
    const linkRewrite = linkRewriteElements.length > 0 ? linkRewriteElements[0].textContent : '';

    const imageUrl = `${this.baseUrl}/${imageId}-small_default/${encodeURIComponent(linkRewrite)}.jpg`;
    this.imageCache.set(referencia, imageUrl);

    return imageUrl;
  }
}
