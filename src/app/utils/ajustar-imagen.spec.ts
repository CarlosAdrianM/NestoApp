import { ajustarImagen } from './ajustar-imagen';

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
});
