/**
 * NestoApp#188: en el móvil la captura se hace con el botón de pantallazo y se elige de la galería.
 * Un pantallazo PNG de un móvil actual (1080x2400 o más) pasa con facilidad de los 2 MB que admite
 * NestoAPI#520, y algunas galerías lo guardan en WebP o HEIC. Así que lo que no cabe o no es PNG/JPEG
 * se redibuja en JPEG (y, si hace falta, más pequeño) antes de mandarlo.
 */
export const TIPOS_IMAGEN_DIRECTOS = ['image/png', 'image/jpeg'];
export const LADO_MAXIMO_IMAGEN = 2000;

export async function ajustarImagen(imagen: Blob, tamanoMaximo: number): Promise<Blob> {
  const tipo = (imagen.type || '').toLowerCase();
  if (TIPOS_IMAGEN_DIRECTOS.includes(tipo) && imagen.size <= tamanoMaximo) {
    return imagen;
  }
  const bitmap = await createImageBitmap(imagen); // lanza si el navegador no sabe leerla
  try {
    let escala = Math.min(1, LADO_MAXIMO_IMAGEN / Math.max(bitmap.width, bitmap.height));
    let calidad = 0.85;
    for (let intento = 0; intento < 6; intento++) {
      const jpeg = await redibujarEnJpeg(bitmap, escala, calidad);
      if (jpeg.size <= tamanoMaximo) {
        return jpeg;
      }
      escala *= 0.75;
      calidad = Math.max(0.6, calidad - 0.1);
    }
    throw new Error('La imagen sigue siendo demasiado grande tras reducirla');
  } finally {
    bitmap.close();
  }
}

function redibujarEnJpeg(bitmap: ImageBitmap, escala: number, calidad: number): Promise<Blob> {
  const lienzo = document.createElement('canvas');
  lienzo.width = Math.max(1, Math.round(bitmap.width * escala));
  lienzo.height = Math.max(1, Math.round(bitmap.height * escala));
  const contexto = lienzo.getContext('2d');
  contexto.fillStyle = '#fff'; // JPEG no tiene transparencia: fondo blanco en vez de negro
  contexto.fillRect(0, 0, lienzo.width, lienzo.height);
  contexto.drawImage(bitmap, 0, 0, lienzo.width, lienzo.height);
  return new Promise((resolve, reject) =>
    lienzo.toBlob(b => b ? resolve(b) : reject(new Error('No se ha podido convertir la imagen')), 'image/jpeg', calidad));
}

/** Para pintar la imagen (miniatura) y para mandarla a la API, que admite el prefijo «data:». */
export function leerComoDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result as string);
    lector.onerror = () => reject(lector.error);
    lector.readAsDataURL(blob);
  });
}
