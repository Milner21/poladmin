export type TipoPadron = "INTERNO" | "GENERAL";

export interface PadronInterno {
  id: string;
  ci: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string | null;
  departamento: string | null;
  distrito: string | null;
  seccional: string | null;
  local_votacion: string | null;
  mesa: string | null;
  orden: string | null;
  fecha_carga: string;
  partido_id: string | null;
  partido: { id: string; nombre: string; sigla: string } | null;
}

export interface PadronGeneral {
  id: string;
  ci: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string | null;
  departamento: string | null;
  distrito: string | null;
  local_votacion: string | null;
  mesa: string | null;
  orden: string | null;
  fecha_carga: string;
}

export interface ResultadoCargaPadron {
  tipo: TipoPadron;
  total_filas: number;
  insertados: number;
  omitidos: number;
  actualizados: number;
  errores_count: number;
  errores: { fila: number; motivo: string }[];
}

export interface StatsPadron {
  padron_interno: number;
  padron_general: number;
}

export interface ListadoPadron {
  tipo: TipoPadron;
  total: number;
  registros: PadronInterno[] | PadronGeneral[];
}

export interface ResultadoPadronDto {
  ci: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string | null;
  departamento: string | null;
  distrito: string | null;
  seccional: string | null;
  local_votacion: string | null;
  mesa_votacion: string | null;
  orden_votacion: string | null;
  es_afiliado: boolean;
}

export type EncontradoEn =
  | "SIMPATIZANTE"
  | "PADRON_INTERNO"
  | "PADRON_GENERAL"
  | "NO_ENCONTRADO";

export interface DatosPadronInterno {
  seccional: string | null;
  local_votacion: string | null;
  mesa: string | null;
  orden: string | null;
}

export interface DatosPadronGeneral {
  local_votacion: string | null;
  mesa: string | null;
  orden: string | null;
}

export interface DatosBusquedaInteligente {
  ci: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string | null;
  departamento: string | null;
  distrito: string | null;
  padron_interno: DatosPadronInterno | null;
  padron_general: DatosPadronGeneral | null;
}

export interface ResultadoBusquedaInteligente {
  encontrado_en: EncontradoEn;
  simpatizante_existente: boolean;
  simpatizante_base_existente: boolean;
  simpatizante_id: string | null;
  permite_registro_manual: boolean;
  permite_duplicados_simpatizantes: boolean;
  modo_eleccion: "INTERNAS" | "GENERALES";
  datos: DatosBusquedaInteligente | null;
  mensaje: string;
}

// Resumen por departamento/distrito
export interface ResumenDistrito {
  distrito: string;
  total: number;
}

export interface ResumenDepartamento {
  departamento: string;
  total: number;
  distritos: ResumenDistrito[];
}

export interface ResumenPadron {
  tipo: TipoPadron;
  departamentos: ResumenDepartamento[];
}

// Detalle paginado por distrito
export interface DetallePadronParams {
  tipo: TipoPadron;
  departamento: string;
  distrito: string;
  pagina: number;
  limite: number;
  buscar?: string;
}

export interface DetallePadronResponse {
  tipo: TipoPadron;
  departamento: string;
  distrito: string;
  total: number;
  pagina: number;
  limite: number;
  total_paginas: number;
  registros: PadronInterno[] | PadronGeneral[];
}

// Tipos para consulta de votante
export type EstadoVotante =
  | "SIMPATIZANTE_REGISTRADO"
  | "EN_PADRON_NO_REGISTRADO"
  | "NO_ENCONTRADO";

export interface DatosVotante {
  ci: string;
  nombre: string;
  apellido: string;
  local_votacion: string | null;
  mesa: string | null;
  orden: string | null;
  departamento: string | null;
  distrito: string | null;
}

export interface ResultadoConsultaVotante {
  estado: EstadoVotante;
  datos: DatosVotante | null;
  simpatizante_id: string | null;
  modo_eleccion: "INTERNAS" | "GENERALES";
  voto: boolean;
  fecha_voto: string | null;
  ticket_impreso: boolean;
  fecha_impresion: string | null;
  puede_reimprimir: boolean;
  permite_registro_manual: boolean;
  mensaje: string;
}
