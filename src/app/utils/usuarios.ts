/**
 * NestoApp#276: compara dos usuarios (p. ej. `NUEVAVISION\DLopez` de la BD con `NUEVAVISION\dlopez`
 * de lo tecleado al iniciar sesión) sin distinguir mayúsculas ni espacios sobrantes. La API ya los trata
 * como la misma persona (NestoAPI#827, `UsuarioAuditoriaHelper.MismaPersona`).
 */
export function esMismoUsuario(a: string | null | undefined, b: string | null | undefined): boolean {
  const normalizar = (u: string | null | undefined) => (u || '').toString().trim().toLowerCase();
  const na = normalizar(a);
  return na !== '' && na === normalizar(b);
}
