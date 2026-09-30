import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PrestashopService } from './prestashop.service';

/**
 * #159: las fotos de Prestashop salen por CapacitorHttp (viene dentro de Capacitor, ya está en el
 * APK de los vendedores) en vez de por cordova-plugin-advanced-http, para que el próximo APK pueda
 * quitar el plugin sin tocar nada más.
 */
describe('PrestashopService: petición nativa (#159)', () => {
  let servicio: PrestashopService;

  const xml = `<?xml version="1.0"?><prestashop><products><product>
    <associations><images><image><id>4321</id></image></images></associations>
    <link_rewrite><language id="1">crema-roseta</language></link_rewrite>
  </product></products></prestashop>`;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    servicio = TestBed.inject(PrestashopService);
  });

  it('pide el XML con CapacitorHttp, como texto y con la clave en Basic', async () => {
    const get = jasmine.createSpy('get').and.resolveTo({ status: 200, data: xml, headers: {}, url: '' });

    servicio['peticionNativa'] = get;
    const respuesta = await servicio['fetchNativo']('https://tienda/api/products?filter[reference]=38093&display=full');

    expect(respuesta).toBe(xml);
    const opciones = get.calls.mostRecent().args[0];
    expect(opciones.url).toBe('https://tienda/api/products?filter[reference]=38093&display=full');
    expect(opciones.responseType).toBe('text');
    expect(opciones.headers['Authorization']).toMatch(/^Basic /);
  });

  it('un error HTTP no se toma por un XML vacío', async () => {
    servicio['peticionNativa'] = jasmine.createSpy('get').and.resolveTo({ status: 401, data: 'Unauthorized', headers: {}, url: '' });

    await expectAsync(servicio['fetchNativo']('https://tienda/api/products')).toBeRejected();
  });

  it('la URL de la imagen sale del XML', () => {
    const url = servicio['parsearImagenDeXml']('38093', xml);
    expect(url).toContain('/4321-small_default/crema-roseta.jpg');
  });
});
