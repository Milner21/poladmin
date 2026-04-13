export type AccionAuditoria =
  | 'CREAR'
  | 'EDITAR'
  | 'ELIMINAR'
  | 'CAMBIAR_CAMPANA'
  | 'LOGIN'
  | 'LOGOUT'
  | 'CAMBIAR_PASSWORD';

export type ModuloAuditoria =
  | 'USUARIOS'
  | 'SIMPATIZANTES'
  | 'EVENTOS'
  | 'CAMPANAS'
  | 'NIVELES'
  | 'PERFILES'
  | 'PERMISOS'
  | 'PADRON'
  | 'AUTH';

// Tipos específicos para datos de auditoría
export interface DatosUsuarioAuditoria {
  nombre?: string;
  apellido?: string;
  username?: string;
  documento?: string;
  perfil_id?: string;
  nivel_id?: string;
  campana_id?: string;
  estado?: boolean;
  candidato_superior_id?: string;
  telefono?: string;
}

export interface DatosSimpatizanteAuditoria {
  nombre?: string;
  apellido?: string;
  documento?: string;
  telefono?: string;
  departamento?: string;
  distrito?: string;
  barrio?: string;
  es_afiliado?: boolean;
  origen_registro?: string;
}

export interface DatosCampanaAuditoria {
  nombre?: string;
  nivel_campana?: string;
  departamento?: string;
  distrito?: string;
  estado?: boolean;
}

export type DatosAuditoria = 
  | DatosUsuarioAuditoria 
  | DatosSimpatizanteAuditoria 
  | DatosCampanaAuditoria 
  | Record<string, string | number | boolean | null>;

export interface AuditoriaLog {
  id: string;
  usuario_id: string | null;
  accion: AccionAuditoria;
  modulo: ModuloAuditoria;
  entidad_id: string | null;
  entidad_tipo: string | null;
  datos_antes: DatosAuditoria | null;
  datos_despues: DatosAuditoria | null;
  ip_address: string | null;
  user_agent: string | null;
  fecha_accion: string;
}

export interface FiltrosAuditoria {
  modulo?: ModuloAuditoria;
  accion?: AccionAuditoria;
  fechaDesde?: Date;
  fechaHasta?: Date;
  limit?: number;
}