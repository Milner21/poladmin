import type { Nivel } from './nivel.types';

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
}

export interface LoginResponse {
  message: string;
  usuario: Usuario;
  access_token: string;
  refresh_token: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}