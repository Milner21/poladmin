// src/types/estadisticas.types.ts

export interface ItemPuestoDiaD {
  puesto_codigo: string;
  puesto_descripcion: string | null;
  tickets_impresos: number;
  reimpresiones: number;
  organicos: number;
  activaciones: number;
  verificaciones: number;
  solidaridades: number;
}

export interface RespuestaDiaD {
  // Flags de configuracion de campana
  usar_activador_ticket: boolean;
  usar_verificador_asistencia: boolean;
  usar_solidaridad: boolean;
  modo_eleccion: string;

  // Embudo principal
  total_tickets_impresos: number;
  total_activados: number;
  total_verificados: number;
  total_solidaridad: number;

  // Porcentajes de conversion
  porcentaje_activados: number;
  porcentaje_verificados: number;
  porcentaje_solidaridad: number;

  // Organicos
  total_organicos: number;
  porcentaje_organicos_sobre_impresos: number;

  // Reimpresiones
  total_reimpresiones: number;

  // Por puesto
  por_puesto: ItemPuestoDiaD[];
}

export interface RespuestaApiDiaD {
  success: boolean;
  data: RespuestaDiaD;
}
