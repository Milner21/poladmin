import { IsString, IsNumber, IsOptional } from 'class-validator';

export class AsistenciaPorEventoItemDto {
  @IsString()
  evento_id: string;

  @IsString()
  evento_nombre: string;

  @IsNumber()
  total_asistencias: number;

  @IsString()
  fecha_evento: string; // ISO date YYYY-MM-DD
}