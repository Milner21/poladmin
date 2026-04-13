export interface DashboardEstadisticas {
  total_simpatizantes: number;
  total_simpatizantes_cambio: number;
  total_simpatizantes_hoy: number;
  total_simpatizantes_semana: number;
  total_simpatizantes_mes: number;
  total_eventos_confirmados: number;
  total_eventos_no_confirmados: number;
  total_asistencias_confirmadas: number;
  total_asistencias_ausencias: number;
  porcentaje_asistencia: number;
  total_mi_red: number;

  // Origen de registro
  total_padron_interno: number;
  total_padron_general: number;
  total_manual: number;
  porcentaje_padron_interno: number;
  porcentaje_padron_general: number;
  porcentaje_manual: number;

  // Contactabilidad
  total_con_telefono: number;
  total_sin_telefono: number;
  porcentaje_contactables: number;

  // GPS
  total_con_gps: number;
  porcentaje_con_gps: number;

  // Transporte
  total_necesitan_transporte: number;
  porcentaje_necesitan_transporte: number;

  // Voto probable
  total_voto_probable: number;
  porcentaje_voto_probable: number;
}

export interface SimpatizantesEvolucion {
  mes: string;
  mes_nombre: string;
  total: number;
}

export interface SimpatizantesEvolucionDiaria {
  dia: string;
  dia_inicio: string;
  dia_fin: string;
  total: number;
}

export interface AsistenciasPorEvento {
  evento_id: number;
  evento_nombre: string;
  total_asistencias: number;
  fecha_evento: string;
}

export interface DistribucionRed {
  rol: string;
  rol_nombre: string;
  total: number;
}

export interface EventoReciente {
  id: number;
  nombre: string;
  descripcion: string;
  fecha: string;
  hora: string;
  lugar: string;
  total_asistencias: number;
  creado_por: {
    id: number;
    nombre: string;
    apellido: string;
    rol: string;
  };
  created_at: string;
  [key: string]: unknown;
}

export interface Top10Registros {
  id: string;
  nombre: string;
  apellido: string;
  perfil: string;
  total_simpatizantes_registrados: number;
}

export interface DashboardData {
  estadisticas: DashboardEstadisticas;
  simpatizantes_evolucion: SimpatizantesEvolucion[];
  asistencias_por_evento: AsistenciasPorEvento[];
  distribucion_red: DistribucionRed[];
  eventos_recientes: EventoReciente[];
  top_10_registros: Top10Registros[];
}

export type TopUsuario = {
  id: string;
  nombre: string;
  apellido: string;
  perfil: string;
  total_simpatizantes_registrados: number;
  [key: string]: unknown;
};

export interface IntencionVotoDashboard {
  seguro: number;
  probable: number;
  indeciso: number;
  contrario: number;
  total: number;
}