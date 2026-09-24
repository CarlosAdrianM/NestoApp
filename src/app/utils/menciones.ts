/**
 * NestoApp#194 / NestoAPI#537: @menciones en los comentarios y sugerencias de Novedades. Al
 * mencionado le llega un push que abre el comentario (#193). Mismo patrón que ReglasMenciones de
 * NestoAPI: la @ al principio o tras algo que no sea letra, dígito, punto o @ (así un correo no es
 * una mención) y un nombre que empieza por letra.
 */

export interface Mencionable {
  /** Lo que se escribe tras la @. */
  Nombre: string;
  /** Su identidad para el aviso (en la app, su UserName). */
  Clave: string;
  /** NestoApp (push) o Nesto (buzón). */
  Aplicacion: string;
}

const PATRON_MENCION = /(?<![\p{L}\p{Nd}.@])@([\p{L}][\p{L}\p{Nd}_]*)/gu;
/** Lo que se está escribiendo justo antes del cursor: @ y, quizá, el principio del nombre. */
const PATRON_EN_CURSO = /(?<![\p{L}\p{Nd}.@])@([\p{L}\p{Nd}_]*)$/u;

export const MAXIMO_SUGERENCIAS_MENCION = 6;

/** Sin tildes ni mayúsculas, como en la API: «@maria» menciona a «María». */
export function normalizarNombre(nombre: string): string {
  return (nombre || '').normalize('NFD').replace(/\p{Mn}/gu, '').toUpperCase();
}

/** Si el cursor está escribiendo una mención, dónde empieza (la @) y lo tecleado tras ella. */
export function mencionEnCurso(texto: string, cursor: number): { inicio: number; filtro: string } | null {
  const antes = (texto || '').slice(0, cursor);
  const coincidencia = PATRON_EN_CURSO.exec(antes);
  if (!coincidencia) {
    return null;
  }
  return { inicio: coincidencia.index, filtro: coincidencia[1] };
}

/** Primero los que empiezan por lo escrito y luego los que lo contienen. */
export function filtrarMencionables(lista: Mencionable[], filtro: string, maximo: number = MAXIMO_SUGERENCIAS_MENCION): Mencionable[] {
  const buscado = normalizarNombre(filtro);
  const empiezan = (lista || []).filter(m => normalizarNombre(m.Nombre).startsWith(buscado));
  const contienen = (lista || []).filter(m => !empiezan.includes(m) && normalizarNombre(m.Nombre).includes(buscado));
  return [...empiezan, ...contienen].slice(0, maximo);
}

/** Sustituye la @ y lo tecleado (de `inicio` al cursor) por «@Nombre ». */
export function insertarMencion(texto: string, inicio: number, cursor: number, nombre: string): { texto: string; cursor: number } {
  const mencion = '@' + nombre + ' ';
  return {
    texto: texto.slice(0, inicio) + mencion + texto.slice(cursor),
    cursor: inicio + mencion.length
  };
}

export interface TrozoTexto {
  texto: string;
  mencion: boolean;
}

/** Para pintar las menciones resaltadas dentro del texto. */
export function trocearMenciones(texto: string): TrozoTexto[] {
  const trozos: TrozoTexto[] = [];
  if (!texto) {
    return trozos;
  }
  let ultimo = 0;
  const patron = new RegExp(PATRON_MENCION.source, PATRON_MENCION.flags); // lastIndex propio
  let coincidencia: RegExpExecArray | null;
  while ((coincidencia = patron.exec(texto)) !== null) {
    if (coincidencia.index > ultimo) {
      trozos.push({ texto: texto.slice(ultimo, coincidencia.index), mencion: false });
    }
    trozos.push({ texto: coincidencia[0], mencion: true });
    ultimo = coincidencia.index + coincidencia[0].length;
  }
  if (ultimo < texto.length) {
    trozos.push({ texto: texto.slice(ultimo), mencion: false });
  }
  return trozos;
}
