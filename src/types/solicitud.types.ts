export const PrioridadSolicitud = {
  ALTA: 'ALTA',
  MEDIA: 'MEDIA',
  BAJA: 'BAJA',
} as const;

export type PrioridadSolicitud = typeof PrioridadSolicitud[keyof typeof PrioridadSolicitud];

export const EstadoSolicitud = {
  PENDIENTE: 'PENDIENTE',
  EN_PROCESO: 'EN_PROCESO',
  AGENDADA: 'AGENDADA',
  CUMPLIDA: 'CUMPLIDA',
  RECHAZADA: 'RECHAZADA',
} as const;

export type EstadoSolicitud = typeof EstadoSolicitud[keyof typeof EstadoSolicitud];

export interface Solicitud {
  id: string;
  campana_id: string;
  simpatizante_id: string;
  titulo: string;
  descripcion: string;
  prioridad: PrioridadSolicitud;
  estado: EstadoSolicitud;
  registrado_por_id: string;
  asignado_a_id: string | null;
  candidato_id: string | null;
  lider_id: string | null;
  fecha_limite: string | null;
  fecha_cierre: string | null;
  fecha_registro: string;
  eliminado: boolean;

  // Relaciones
  simpatizante?: {
    id: string;
    nombre: string;
    apellido: string;
    documento: string;
  };
  registrado_por?: {
    id: string;
    nombre: string;
    apellido: string;
  };
  asignado_a?: {
    id: string;
    nombre: string;
    apellido: string;
  } | null;
  candidato?: {
    id: string;
    nombre: string;
    apellido: string;
  } | null;
  lider?: {
    id: string;
    nombre: string;
    apellido: string;
  } | null;
  campana?: {
    id: string;
    nombre: string;
  };
  _count?: {
    movimientos: number;
  };
}

export interface MovimientoSolicitud {
  id: string;
  solicitud_id: string;
  usuario_id: string;
  accion: string;
  comentario: string | null;
  estado_anterior: string | null;
  estado_nuevo: string | null;
  asignado_anterior_id: string | null;
  asignado_nuevo_id: string | null;
  fecha_movimiento: string;

  usuario?: {
    id: string;
    nombre: string;
    apellido: string;
    perfil: {
      nombre: string;
    };
  };
}

export interface CreateSolicitudDto {
  simpatizante_id: string;
  titulo: string;
  descripcion: string;
  prioridad?: PrioridadSolicitud;
  fecha_limite?: string;
  asignado_a_id?: string;
}

export interface UpdateSolicitudDto {
  titulo?: string;
  descripcion?: string;
  prioridad?: PrioridadSolicitud;
  fecha_limite?: string;
}

export interface AsignarSolicitudDto {
  asignado_a_id: string;
  comentario?: string;
}

export interface CambiarEstadoSolicitudDto {
  estado: EstadoSolicitud;
  comentario?: string;
}

export interface AgendarSolicitudDto {
  fecha_limite: string;
  comentario?: string;
}

export interface DashboardSolicitudes {
  total: number;
  por_estado: {
    pendientes: number;
    en_proceso: number;
    agendadas: number;
    cumplidas: number;
    rechazadas: number;
  };
  por_prioridad: {
    alta: number;
    media: number;
    baja: number;
  };
}