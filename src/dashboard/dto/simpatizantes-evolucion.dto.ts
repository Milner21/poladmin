import { IsString, IsNumber, IsDateString } from 'class-validator';

export class SimpatizanteEvolucionItemDto {
  @IsString()
  semana: string; // formato "YYYY-WW" (ISO week label)

  @IsDateString()
  semana_inicio: string; // ISO 8601 YYYY-MM-DDTHH:mm:ssZ o YYYY-MM-DDT00:00:00Z

  @IsDateString()
  semana_fin: string; // ISO 8601

  @IsNumber()
  total: number;
}