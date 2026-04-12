import { IsString, IsUUID, IsEnum, IsOptional, IsDateString, MinLength } from 'class-validator';

export enum PrioridadSolicitud {
  ALTA = 'ALTA',
  MEDIA = 'MEDIA',
  BAJA = 'BAJA',
}

export class CreateSolicitudDto {
  @IsUUID()
  simpatizante_id: string;

  @IsString()
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres' })
  titulo: string;

  @IsString()
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  descripcion: string;

  @IsEnum(PrioridadSolicitud)
  @IsOptional()
  prioridad?: PrioridadSolicitud;

  @IsDateString()
  @IsOptional()
  fecha_limite?: string;

  @IsUUID()
  @IsOptional()
  asignado_a_id?: string;
}