import { IsString, IsNumber, IsDateString } from 'class-validator';

export class SimpatizantesEvolucionDiariaDto {
  @IsString()
  dia: string; // formato "YYYY-MM-DD"

  @IsDateString()
  dia_inicio: string; // ISO 8601 YYYY-MM-DDTHH:mm:ssZ

  @IsDateString()
  dia_fin: string; // ISO 8601 YYYY-MM-DDTHH:mm:ssZ

  @IsNumber()
  total: number;
}