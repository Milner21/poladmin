import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum EstadoSolicitud {
  PENDIENTE = 'PENDIENTE',
  EN_PROCESO = 'EN_PROCESO',
  AGENDADA = 'AGENDADA',
  CUMPLIDA = 'CUMPLIDA',
  RECHAZADA = 'RECHAZADA',
}

export class CambiarEstadoSolicitudDto {
  @IsEnum(EstadoSolicitud)
  estado: EstadoSolicitud;

  @IsString()
  @IsOptional()
  comentario?: string;
}