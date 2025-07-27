// types/eventos.ts
export interface Evento {
  id: string;
  nombre: string;
  descripcion?: string;
  fecha_evento: string;
  hora_evento: string;
  lugar?: string;
  activo: boolean;
}

export interface VotanteParaEvento {
  id: string;
  ci: string;
  nombre: string;
  apellido: string;
  telefono: string;
  barrio: string;
  sexo: string;
  edad: number;
  // Indicar si ya asistió a este evento
  ya_asistio?: boolean;
}


export interface AsistenciaEvento {
  id: string;
  evento_id: string;
  votante_id: string;
  votante_ci: string;
  votante_nombre: string;
  votante_apellido: string;
  votante_telefono: string;
  votante_barrio: string;
  fecha_asistencia: string;
  registrado_por: string;
}