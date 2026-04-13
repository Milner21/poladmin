import type { Nivel } from "./nivel.types";

export interface Permiso {
  id: string;
  nombre: string;
  descripcion: string;
  modulo: string;
  accion: string;
  fecha_registro: string;
}

export interface PerfilPermiso {
  perfil_id: string;
  permiso_id: string;
  permiso: Permiso;
}

export interface Perfil {
  id: string;
  nombre: string;
  nivel_id: string | null;
  nivel?: Nivel | null;
  es_operativo: boolean;
  username_manual: boolean;
  estado: boolean;
  creado_por_id: string | null;
  fecha_registro: string;
  fecha_actualizacion: string;
  actualizado_por_id: string | null;
  permisos: PerfilPermiso[];
}

export interface UsuarioPermisoPersonalizado {
  id: string;
  usuario_id: string;
  permiso_id: string;
  estado: boolean;
  creado_por_id: string;
  fecha_registro: string;
  permiso: Permiso;
}

export interface Usuario {
  id: string;
  campana_id: string | null;
  nombre: string;
  apellido: string;
  username: string;
  documento: string;
  telefono: string | null;
  perfil_id: string;
  nivel_id: string | null;
  nivel?: Nivel | null;
  es_operativo?: boolean;
  candidato_superior_id: string | null;
  estado: boolean;
  fecha_registro: string;
  registrado_por_id: string | null;
  creado_por_id: string | null;
  actualizado_por_id: string | null;
  fecha_actualizacion: string;
  eliminado: boolean;
  fecha_eliminacion: string | null;
  eliminado_por_id: string | null;
  perfil: Perfil;
  permisos_personalizados: UsuarioPermisoPersonalizado[];
  [key: string]: unknown;
  candidato_superior?: {
    id: string;
    nombre: string;
    apellido: string;
    username: string;
  } | null;
}

export interface CreateUsuarioDto {
  nombre: string;
  apellido: string;
  documento: string;
  password: string;
  perfil_id: string;
  nivel_id?: string;
  telefono?: string;
  username?: string;
  candidato_superior_id?: string;
  permisos_ids?: string[];
  campana_id?: string;
}

export interface UpdateUsuarioDto {
  nombre?: string;
  apellido?: string;
  documento?: string;
  telefono?: string;
  perfil_id?: string;
  nivel_id?: string;
  candidato_superior_id?: string;
  estado?: boolean;
  permisos_ids?: string[];
  campana_id?: string;
}

export interface CandidatoSuperior {
  id: string;
  nombre: string;
  apellido: string;
  username: string;
  nivel: {
    id: string;
    nombre: string;
    orden: number;
  };
}

export interface EstadisticasUsuarios {
  campana_id: string;
  total: number;
  activos: number;
  inactivos: number;
  operativos: number;
  por_nivel: Array<{
    nivel: {
      id: string;
      nombre: string;
      orden: number;
      exclusivo_root: boolean;
    } | null;
    cantidad: number;
  }>;
}