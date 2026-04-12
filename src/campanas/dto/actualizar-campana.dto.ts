import { IsString, IsOptional, IsBoolean, IsIn, IsUUID } from 'class-validator';

export class ActualizarCampanaDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  @IsIn(['PAIS', 'DEPARTAMENTO', 'DISTRITO'])
  nivel_campana?: 'PAIS' | 'DEPARTAMENTO' | 'DISTRITO';

  @IsString()
  @IsOptional()
  departamento?: string;

  @IsString()
  @IsOptional()
  distrito?: string;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;

  @IsString()
  @IsOptional()
  @IsIn(['PARTIDO', 'MOVIMIENTO'])
  tipo_campana?: 'PARTIDO' | 'MOVIMIENTO';

  @IsUUID()
  @IsOptional()
  partido_id?: string;

  @IsString()
  @IsOptional()
  @IsIn(['INTERNAS', 'GENERALES'])
  modo_eleccion?: 'INTERNAS' | 'GENERALES';
}