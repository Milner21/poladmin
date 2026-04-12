import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateIf, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum EstadoVerificacion {
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
}

export class DatosSimpatizanteDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  apellido: string;

  @IsString()
  @IsNotEmpty()
  documento: string;

  @IsString()
  @IsNotEmpty()
  local_votacion: string;

  @IsString()
  @IsOptional()
  mesa_votacion?: string;

  @IsString()
  @IsOptional()
  orden_votacion?: string;
}

export class ResolverVerificacionDto {
  @IsEnum(EstadoVerificacion)
  estado: EstadoVerificacion;

  @ValidateIf((o) => o.estado === EstadoVerificacion.RECHAZADO)
  @IsString()
  @IsNotEmpty()
  motivo_rechazo?: string;

  @ValidateIf((o) => o.estado === EstadoVerificacion.APROBADO)
  @ValidateNested()
  @Type(() => DatosSimpatizanteDto)
  @IsNotEmpty()
  datos_simpatizante?: DatosSimpatizanteDto;
}