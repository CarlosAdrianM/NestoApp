/**
 * NestoApp#212 / NestoAPI#603: a quién llamar hoy (por prioridad y cadencia) y a qué ritmo va el
 * vendedor. Toda la lógica (qué cliente toca, con qué prioridad y por qué) es del servidor: aquí
 * solo se ordena para pintar y se marca la atendida al crear el rapport. Los campos llegan en
 * PascalCase, como los serializa NestoAPI.
 */
export type PrioridadContacto = 'Máxima' | 'Alta' | 'Media' | 'Baja';

export interface RitmoContactos {
  ContactosHoy: number;
  ContactosSemana: number;
  ContactosMes: number;
  ObjetivoMes: number;
  ObjetivoHoy: number;
  DiasLaborablesRestantesMes: number;
  PendientesMaxima: number;
  PendientesAlta: number;
  PendientesMedia: number;
  PendientesBaja: number;
  Frase: string;
}

export interface SugerenciaContacto {
  SugerenciaId: number;
  Cliente: string;
  Contacto: string;
  Nombre: string;
  Direccion: string;
  CodigoPostal?: string;
  Poblacion: string;
  Provincia?: string;
  Telefono: string;
  Prioridad: PrioridadContacto;
  /** 1, 2, 3… en el orden en que conviene llamar. */
  Orden: number;
  /** Por qué toca hoy, en texto legible. */
  Motivo: string;
  Probabilidad: number;
  /** Null si no consta ningún rapport en el que se hablara con el cliente. */
  DiasDesdeUltimoContacto: number | null;
  DiasDesdeUltimoPedido: number;
  CadenciaDias: number;
  PedidosUltimos12Meses: number;
  ImporteUltimos12Meses: number;
  /** True si ya hay un rapport de este cliente hoy. */
  Atendida: boolean;
}

export interface SugerenciasContactoRespuesta {
  Vendedor: string;
  Fecha: string;
  Ritmo: RitmoContactos | null;
  Sugerencias: SugerenciaContacto[];
}

/**
 * Como en Nesto (OrdenSugerenciasContacto): las pendientes primero, por el Orden que manda la API;
 * las atendidas al final (sin desaparecer, para que el vendedor vea lo que ya ha hecho), también por
 * su Orden. Devuelve una lista nueva.
 */
export function ordenarSugerenciasContacto(sugerencias: SugerenciaContacto[]): SugerenciaContacto[] {
  const orden = (s: SugerenciaContacto) => (s.Orden > 0 ? s.Orden : Number.MAX_SAFE_INTEGER);
  return (sugerencias || [])
    .filter(s => !!s)
    .map((s, i) => ({ s, i }))
    .sort((a, b) => (+!!a.s.Atendida - +!!b.s.Atendida) || (orden(a.s) - orden(b.s)) || (a.i - b.i))
    .map(x => x.s);
}

/** Color de Ionic de cada prioridad (sin tocar la paleta: rojo lo urgente, gris lo que puede esperar). */
export function colorPrioridad(prioridad: string): string {
  switch (prioridad) {
    case 'Máxima': return 'danger';
    case 'Alta': return 'warning';
    case 'Media': return 'primary';
    default: return 'medium';
  }
}

/**
 * Al crear un rapport de un cliente sugerido, la API marca su sugerencia como atendida. Aquí se hace
 * lo mismo en la lista que ya se está viendo, sin volver a pedirla. Devuelve una lista nueva ordenada.
 */
export function marcarAtendida(sugerencias: SugerenciaContacto[], cliente: string, contacto: string): SugerenciaContacto[] {
  const mismo = (a: string, b: string) => (a || '').trim() === (b || '').trim();
  return ordenarSugerenciasContacto((sugerencias || []).map(s =>
    mismo(s.Cliente, cliente) && mismo(s.Contacto, contacto) ? { ...s, Atendida: true } : s));
}

/** El primer teléfono de la ficha, solo con lo que vale para marcar (en la ficha pueden ir varios separados por «/»). */
export function telefonoParaLlamar(telefono: string): string {
  const primero = (telefono || '').split(/[/,;]/)[0];
  return primero.replace(/[^\d+]/g, '');
}
