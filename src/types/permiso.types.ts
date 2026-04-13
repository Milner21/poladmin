export interface Permiso {
  id: string;
  nombre: string;
  descripcion?: string;
  modulo: string;
  accion: string;
}

export type ModuloPermiso =
  | "usuarios"
  | "niveles"
  | "perfiles"
  | "permisos"
  | "eventos"
  | "simpatizantes"
  | "asistencias"
  | "dashboard"
  | "campanas"
  | "solicitudes"
  | "transportes"
  | "impresoras"
  | "padron";

export const MODULOS: ModuloPermiso[] = [
  "usuarios",
  "niveles",
  "perfiles",
  "permisos",
  "eventos",
  "simpatizantes",
  "asistencias",
  "dashboard",
  "campanas",
  "solicitudes",
  "transportes",
  "impresoras",
  "padron",
];

export interface CreatePermisoDto {
  nombre: string;
  descripcion?: string;
  modulo: ModuloPermiso;
  accion: string;
}

export interface UpdatePermisoDto {
  nombre?: string;
  descripcion?: string;
  modulo?: ModuloPermiso;
  accion?: string;
}
