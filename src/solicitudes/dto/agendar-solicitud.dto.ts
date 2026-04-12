import { IsDateString, IsOptional, IsString } from 'class-validator';

export class AgendarSolicitudDto {
  @IsDateString()
  fecha_limite: string;

  @IsString()
  @IsOptional()
  comentario?: string;
}