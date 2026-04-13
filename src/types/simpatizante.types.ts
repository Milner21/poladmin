export type OrigenRegistro = 'PADRON_INTERNO' | 'PADRON_GENERAL' | 'MANUAL';

export interface Simpatizante {
  id: string;
  campana_id: string;
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string | null;
  fecha_nacimiento: string | null;
  departamento: string | null;
  distrito: string | null;
  barrio: string | null;
  seccional_interna: string | null;
  local_votacion_interna: string | null;
  mesa_votacion_interna: string | null;
  orden_votacion_interna: string | null;
  local_votacion_general: string | null;
  mesa_votacion_general: string | null;
  orden_votacion_general: string | null;
  es_afiliado: boolean;
  intencion_voto: string;
  observaciones: string | null;
  origen_registro: OrigenRegistro;
  necesita_transporte: boolean;
  latitud: number | null;
  longitud: number | null;
  candidato_id: string | null;
  lider_id: string | null;
  registrado_por_id: string;
  fecha_registro: string;
  eliminado: boolean;
  [key: string]: unknown;
}

export interface CreateSimpatizanteDto {
  nombre: string;
  apellido: string;
  documento: string;
  telefono?: string;
  fecha_nacimiento?: string;
  departamento?: string;
  distrito?: string;
  barrio?: string;
  seccional_interna?: string;
  local_votacion_interna?: string;
  mesa_votacion_interna?: string;
  orden_votacion_interna?: string;
  local_votacion_general?: string;
  mesa_votacion_general?: string;
  orden_votacion_general?: string;
  es_afiliado?: boolean;
  intencion_voto?: string;
  observaciones?: string;
  origen_registro?: OrigenRegistro;
  necesita_transporte?: boolean;
  latitud?: number;
  longitud?: number;
  lider_id?: string;
  candidato_id?: string;
  confirmar_duplicado?: boolean;
}

export interface Direccion {
  id: string;
  departamento: string;
  ciudad: string;
  barrio: string;
  activo: boolean;
  creado_por_id: string | null;
  fecha_carga: string;
}

export interface RegistradorResumen {
  id: string;
  nombre: string;
  apellido: string;
}

export interface SimpatizanteResumen {
  id: string;
  nombre: string;
  apellido: string;
  documento: string;
  intencion_voto: string;
  es_afiliado: boolean;
  barrio: string | null;
  telefono: string | null;
  fecha_registro: string;
  registrado_por_id: string;
}

export interface DuplicadoSimpatizante {
  id: string;
  campana_id: string;
  simpatizante_id: string;
  registrado_por_id_original: string;
  intento_registrar_id: string;
  fecha_intento: string;
  eliminado: boolean;
  eliminado_por_id: string | null;
  fecha_eliminacion: string | null;
  es_dueno_confirmado: boolean;
  resuelto_por_id: string | null;
  fecha_resolucion: string | null;
  simpatizante: SimpatizanteResumen;
  quien_intento: RegistradorResumen;
  registrador_original: RegistradorResumen;
  resuelto_por: RegistradorResumen | null;
  [key: string]: unknown;
}

export interface DuplicadoPorSimpatizante {
  id: string;
  intento_registrar_id: string;
  fecha_intento: string;
  es_dueno_confirmado: boolean;
  quien_intento: RegistradorResumen;
}

export interface ResultadoDuplicadosPorSimpatizante {
  simpatizante: {
    id: string;
    nombre: string;
    apellido: string;
    documento: string;
    registrado_por_id: string;
    campana_id: string;
  };
  registrador_actual: RegistradorResumen | null;
  duplicados: DuplicadoPorSimpatizante[];
  [key: string]: unknown;
}