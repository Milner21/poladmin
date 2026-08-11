export interface CupoActivador extends Record<string, unknown> {
  id: string;
  campana_id: string;
  usuario_id: string;
  cupos_asignados: number;
  cupos_utilizados: number;
  fecha_asignacion: string;

  usuario?: {
    id: string;
    nombre: string;
    apellido: string;
    username: string;
    perfil?: {
      nombre: string;
    };
  };
  asignado_por?: {
    id: string;
    nombre: string;
    apellido: string;
  };
}

export interface ActivacionTicket extends Record<string, unknown> {
  id: string;
  campana_id: string;
  simpatizante_id: string;
  activado_por_id: string;
  puesto_id: string | null;
  metodo: "PIN" | "QR";
  modo_eleccion: "INTERNAS" | "GENERALES";
  fecha_activacion: string;

  simpatizante?: {
    id: string;
    nombre: string;
    apellido: string;
    documento: string;
  };
  puesto?: {
    id: string;
    codigo: string;
    descripcion: string | null;
  };
}

export interface MiCupoResponse {
  tiene_cupo: boolean;
  cupos_asignados: number;
  cupos_utilizados: number;
  cupos_disponibles: number;
  asignado_por: {
    id: string;
    nombre: string;
    apellido: string;
  } | null;
  fecha_asignacion: string | null;
}

export interface ResultadoActivacion {
  activacion_id: string;
  fecha_activacion: string;
  metodo: "PIN" | "QR";
  modo_eleccion: "INTERNAS" | "GENERALES";
  puesto: {
    id: string;
    codigo: string;
    descripcion: string | null;
  };
  simpatizante: {
    id: string;
    nombre: string;
    apellido: string;
    documento: string;
    local_votacion: string | null;
    mesa_votacion: string | null;
    orden_votacion: string | null;
  };
  cupos_restantes: number;
}

export interface ActivarTicketDto {
  pin: string;
  metodo?: "PIN" | "QR";
}

export interface AsignarCupoDto {
  usuario_id: string;
  cupos_asignados: number;
}

export interface ActualizarCupoDto {
  cupos_asignados: number;
}