import type { Permiso } from "./permiso.types";
import type { Nivel } from "./nivel.types";

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
  creado_por_id?: string | null;
  actualizado_por_id?: string | null;
  fecha_registro?: string;
  fecha_actualizacion?: string;
  permisos: PerfilPermiso[];
  [key: string]: unknown;
}

export interface CreatePerfilDto {
  nombre: string;
  nivel_id?: string;
  es_operativo?: boolean;
  username_manual?: boolean;
}

export interface UpdatePerfilDto {
  nombre?: string;
  nivel_id?: string;
  es_operativo?: boolean;
  username_manual?: boolean;
  estado?: boolean;
}
