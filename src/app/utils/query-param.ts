/**
 * Issue #155 / #135: en el build Web de Ionic los queryParams que llevan un objeto
 * se serializan a la cadena "[object Object]" (y tras una recarga del WebView se
 * recuperan desde la URL como string). Si el componente destino los trata como
 * objeto y les asigna propiedades, revienta con:
 *   TypeError: Cannot create property 'X' on string '[object Object]'
 *
 * Este helper centraliza la lectura defensiva: devuelve el objeto si llegó como
 * objeto, intenta parsear JSON si llegó como cadena serializable, y en cualquier
 * otro caso (incluido "[object Object]") devuelve null para que el llamante decida
 * cómo recuperarse (normalmente volver atrás en vez de mostrar una pantalla rota).
 */
export function objetoDeQueryParam<T = any>(valor: any): T | null {
  if (valor && typeof valor === 'object') {
    return valor as T;
  }
  if (typeof valor === 'string') {
    try {
      const parseado = JSON.parse(valor);
      if (parseado && typeof parseado === 'object') {
        return parseado as T;
      }
    } catch {
      // "[object Object]" y demás cadenas no-JSON caen aquí: dato corrupto.
    }
  }
  return null;
}
