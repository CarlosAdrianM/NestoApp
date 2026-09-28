import { ajustarImagen, leerComoDataUrl } from './ajustar-imagen';

/** NestoApp#188: los pantallazos del móvil se ajustan a lo que admite la API antes de mandarlos. */
describe('ajustarImagen (#188)', () => {
  /** Un pantallazo de mentira: ruido, para que el PNG no comprima (como una pantalla con fotos). */
  const pantallazo = (ancho: number, alto: number, tipo = 'image/png'): Promise<Blob> => {
    const lienzo = document.createElement('canvas');
    lienzo.width = ancho;
    lienzo.height = alto;
    const ctx = lienzo.getContext('2d');
    const datos = ctx.createImageData(ancho, alto);
    for (let i = 0; i < datos.data.length; i++) {
      datos.data[i] = (i % 4 === 3) ? 255 : Math.floor(Math.random() * 256);
    }
    ctx.putImageData(datos, 0, 0);
    return new Promise(r => lienzo.toBlob(b => r(b), tipo));
  };

  it('un PNG que ya cabe se manda tal cual', async () => {
    const png = await pantallazo(20, 40);
    expect(await ajustarImagen(png, 1024 * 1024)).toBe(png);
  });

  it('un pantallazo que no cabe se convierte en un JPEG que sí', async () => {
    const png = await pantallazo(400, 800);
    const limite = 60 * 1024;
    expect(png.size).toBeGreaterThan(limite);

    const ajustada = await ajustarImagen(png, limite);

    expect(ajustada.type).toBe('image/jpeg');
    expect(ajustada.size).toBeLessThanOrEqual(limite);
  });

  it('un formato que la API no admite (WebP) se pasa a JPEG', async () => {
    const webp = await pantallazo(20, 40, 'image/webp');
    expect(webp.type).toBe('image/webp');

    const ajustada = await ajustarImagen(webp, 1024 * 1024);

    expect(ajustada.type).toBe('image/jpeg');
  });

  it('lo que no es una imagen legible falla (y el componente lo explica)', async () => {
    const basura = new Blob([new Uint8Array(100)], { type: 'image/heic' });
    await expectAsync(ajustarImagen(basura, 1024 * 1024)).toBeRejected();
  });

  // Issue #195: el WebView de Android no siempre sabe leer con createImageBitmap lo que viene de
  // la galería; el <img> del propio WebView sí, así que se prueba con él antes de rendirse.
  it('si createImageBitmap no puede, lo intenta con una imagen del navegador (#195)', async () => {
    const webp = await pantallazo(20, 40, 'image/webp');
    spyOn(window as any, 'createImageBitmap').and.rejectWith(new DOMException('no', 'InvalidStateError'));

    const ajustada = await ajustarImagen(webp, 1024 * 1024);

    expect(ajustada.type).toBe('image/jpeg');
  });
});

// Issue #195: en la app, cordova-plugin-file sustituye window.FileReader por el suyo, y su onload no
// llega nunca: la captura se quedaba «preparándose» y las imágenes bajadas no se pintaban.
describe('leerComoDataUrl (#195)', () => {
  const lectorOriginal = (window as any).FileReader;
  afterEach(() => (window as any).FileReader = lectorOriginal);

  it('no depende de FileReader (el de Cordova no responde nunca)', async () => {
    (window as any).FileReader = class { readAsDataURL() { /* nunca llama a onload */ } };
    const bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

    const dataUrl = await leerComoDataUrl(new Blob([bytes], { type: 'image/png' }));

    expect(dataUrl).toBe('data:image/png;base64,iVBORw0KGgo=');
  });

  it('una imagen más grande que un trozo sale igual que con el lector del navegador', async () => {
    const bytes = new Uint8Array(200 * 1024).map((_, i) => (i * 31) % 256);
    const blob = new Blob([bytes], { type: 'image/jpeg' });
    const esperado: string = await new Promise(r => { const l = new lectorOriginal(); l.onload = () => r(l.result); l.readAsDataURL(blob); });

    expect(await leerComoDataUrl(blob)).toBe(esperado);
  });
});
