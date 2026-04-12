import { IsNumber } from 'class-validator';

export class EstadisticasDto {
 @IsNumber()
  total_simpatizantes_hoy: number;

  @IsNumber()
  total_simpatizantes_semana: number;

  @IsNumber()
  total_simpatizantes_mes: number;

  @IsNumber()
  total_simpatizantes: number;

  @IsNumber()
  total_eventos_confirmados: number;

  @IsNumber()
  total_eventos_no_confirmados: number;

  @IsNumber()
  total_asistencias_confirmadas: number;

  @IsNumber()
  total_asistencias_ausencias: number;

  @IsNumber()
  porcentaje_asistencia: number; // Calculado

  @IsNumber()
  total_mi_red: number;
}