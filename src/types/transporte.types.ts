export const TipoVehiculo = {
  AUTO: "AUTO",
  SUV: "SUV",
  FURGON: "FURGON",
  OMNIBUS: "OMNIBUS",
  OTRO: "OTRO",
} as const;

export type TipoVehiculo = (typeof TipoVehiculo)[keyof typeof TipoVehiculo];

export const EstadoVerificacion = {
  PENDIENTE: "PENDIENTE",
  APROBADO: "APROBADO",
  RECHAZADO: "RECHAZADO",
} as const;

export type EstadoVerificacion =
  (typeof EstadoVerificacion)[keyof typeof EstadoVerificacion];

export interface Transportista {
  id: string;
  campana_id: string;
  usuario_id: string | null;
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string | null;
  tipo_vehiculo: TipoVehiculo;
  marca_vehiculo: string | null;
  chapa_vehiculo: string;
  capacidad_pasajeros: number;
  estado: boolean;
  registrado_por_id: string;
  fecha_registro: string;
  eliminado: boolean;

  // Relaciones
  campana?: {
    id: string;
    nombre: string;
  };
  usuario?: {
    id: string;
    nombre: string;
    apellido: string;
  } | null;
  registrado_por?: {
    id: string;
    nombre: string;
    apellido: string;
  };
  _count?: {
    pasajeros: number;
    verificaciones: number;
  };
}

export interface PasajeroTransporte {
  id: string;
  transportista_id: string;
  simpatizante_id: string;
  es_duplicado: boolean;
  confirmado: boolean;
  fue_por_cuenta: boolean;
  hora_recogida: string | null;
  registrado_por_id: string;
  fecha_registro: string;
  fecha_confirmacion: string | null;

  // Relaciones
  transportista?: {
    id: string;
    nombre: string;
    apellido: string;
    chapa_vehiculo: string;
    tipo_vehiculo: TipoVehiculo;
  };
  simpatizante?: {
    id: string;
    nombre: string;
    apellido: string;
    documento: string;
    local_votacion_interna: string | null;
    mesa_votacion_interna: string | null;
    orden_votacion_interna: string | null;
    local_votacion_general: string | null;
    mesa_votacion_general: string | null;
    orden_votacion_general: string | null;
    telefono: string | null;
  };
  registrado_por?: {
    id: string;
    nombre: string;
    apellido: string;
  };
}

export interface VerificacionTransporte {
  id: string;
  campana_id: string;
  documento_buscado: string;
  nombre_referencia: string | null;
  apellido_referencia: string | null;
  transportista_id: string;
  operador_id: string | null;
  estado: EstadoVerificacion;
  motivo_rechazo: string | null;
  simpatizante_id: string | null;
  fecha_solicitud: string;
  fecha_resolucion: string | null;

  // Relaciones
  transportista?: {
    id: string;
    nombre: string;
    apellido: string;
    telefono: string | null;
  };
  operador?: {
    id: string;
    nombre: string;
    apellido: string;
  } | null;
  simpatizante?: {
    id: string;
    nombre: string;
    apellido: string;
    documento: string;
  } | null;
}

export interface ConfiguracionTransporte {
  id: string;
  campana_id: string;
  permitir_impresion_tickets: boolean;
  permitir_duplicados: boolean;
  fecha_registro: string;
}

export interface TicketTransporte {
  campana: string;
  fecha: string;
  pasajero: {
    nombre: string;
    documento: string;
  };
  votacion: {
    local: string | null;
    mesa: string | null;
    orden: string | null;
  };
  transporte: {
    conductor: string;
    vehiculo: string;
  };
}

// DTOs

export interface CreateTransportistaDto {
  usuario_id?: string;
  nombre: string;
  apellido: string;
  documento: string;
  telefono?: string;
  tipo_vehiculo: TipoVehiculo;
  marca_vehiculo?: string;
  chapa_vehiculo: string;
  capacidad_pasajeros: number;
}

export interface UpdateTransportistaDto {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  tipo_vehiculo?: TipoVehiculo;
  marca_vehiculo?: string;
  chapa_vehiculo?: string;
  capacidad_pasajeros?: number;
  estado?: boolean;
}

export interface RegistrarPasajeroDto {
  transportista_id: string;
  documento: string;
  hora_recogida?: string;
}

export interface ConfirmarPasajeroDto {
  pasajero_id: string;
}

export interface SolicitarVerificacionDto {
  transportista_id: string;
  documento_buscado: string;
  nombre_referencia?: string;
  apellido_referencia?: string;
}

export interface DatosSimpatizanteDto {
  nombre: string;
  apellido: string;
  documento: string;
  local_votacion: string;
  mesa_votacion?: string;
  orden_votacion?: string;
}

export interface ResolverVerificacionDto {
  estado: EstadoVerificacion;
  motivo_rechazo?: string;
  datos_simpatizante?: DatosSimpatizanteDto;
}

export interface UpdateConfiguracionTransporteDto {
  permitir_impresion_tickets?: boolean;
  permitir_duplicados?: boolean;
}

export interface EstadoConfirmacion {
  transportista_id: string;
  total_pasajeros: number;
  pasajeros_confirmados: number;
  pasajeros_pendientes: number;
  tiene_pendientes: boolean;
}

export interface ResultadoConfirmacionViaje {
  transportista_id: string;
  pasajeros_confirmados: number;
  mensaje: string;
}

export interface LoteConfirmacion {
  hash_lote: string;
  transportista_id: string;
  cantidad_pasajeros: number;
  expira_en_minutos: number;
}

export interface ResultadoConfirmacionLote {
  hash_lote: string;
  transportista: {
    id: string;
    nombre: string;
    apellido: string;
  };
  pasajeros_confirmados: PasajeroTransporte[];
  cantidad: number;
  mensaje: string;
}

export interface LoteConfirmado {
  id: string;
  hash_lote: string;
  fecha_confirmacion: string;
  transportista: {
    id: string;
    nombre: string;
    apellido: string;
    chapa_vehiculo: string;
    tipo_vehiculo: TipoVehiculo;
  };
  cantidad_pasajeros: number;
  pasajeros: PasajeroTransporte[];
}
