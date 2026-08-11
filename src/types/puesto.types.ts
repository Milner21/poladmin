export interface PuestoControl extends Record<string, unknown> {
  id: string;
  campana_id: string;
  codigo: string;
  descripcion: string | null;
  modo_eleccion: "INTERNAS" | "GENERALES";
  activo: boolean;
  fecha_registro: string;

  campana?: {
    id: string;
    nombre: string;
  };
  asignaciones?: AsignacionPuesto[];
  _count?: {
    registros_impresion: number;
    activaciones_ticket: number;
    verificaciones_asistencia: number;
    registros_solidaridad: number;
  };
}

export interface AsignacionPuesto extends Record<string, unknown> {
  id: string;
  puesto_id: string;
  usuario_id: string;
  activo: boolean;
  fecha_asignacion: string;

  usuario?: {
    id: string;
    nombre: string;
    apellido: string;
    username: string;
  };
  puesto?: PuestoControl;
}

export interface CreatePuestoDto {
  codigo: string;
  descripcion?: string;
  modo_eleccion: "INTERNAS" | "GENERALES";
}

export interface UpdatePuestoDto {
  descripcion?: string;
  activo?: boolean;
}

export interface AsignarUsuarioPuestoDto {
  usuario_id: string;
}