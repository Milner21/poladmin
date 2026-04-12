import { IsString, IsEnum, IsOptional, IsDateString, MinLength } from 'class-validator';
import { PrioridadSolicitud } from './create-solicitud.dto';

export class UpdateSolicitudDto {
  @IsString()
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres' })
  @IsOptional()
  titulo?: string;

  @IsString()
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  @IsOptional()
  descripcion?: string;

  @IsEnum(PrioridadSolicitud)
  @IsOptional()
  prioridad?: PrioridadSolicitud;

  @IsDateString()
  @IsOptional()
  fecha_limite?: string;
}