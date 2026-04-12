export type EncontradoEn =
  | 'SIMPATIZANTE'
  | 'PADRON_INTERNO'
  | 'PADRON_GENERAL'
  | 'NO_ENCONTRADO';

export interface DatosBusquedaInteligente {
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
}

export interface ResultadoBusquedaInteligente {
  encontrado_en: EncontradoEn;
  simpatizante_existente: boolean;
  simpatizante_id: string | null;
  permite_registro_manual: boolean;
  permite_duplicados_simpatizantes: boolean;
  datos: DatosBusquedaInteligente | null;
  mensaje: string;
}