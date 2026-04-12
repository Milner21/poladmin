import { IsString, IsNotEmpty, IsOptional, IsIn, IsUUID } from 'class-validator';

export class CrearCampanaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['PAIS', 'DEPARTAMENTO', 'DISTRITO'])
  nivel_campana: 'PAIS' | 'DEPARTAMENTO' | 'DISTRITO';

  @IsString()
  @IsOptional()
  departamento?: string;

  @IsString()
  @IsOptional()
  distrito?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['PARTIDO', 'MOVIMIENTO'])
  tipo_campana: 'PARTIDO' | 'MOVIMIENTO';

  @IsUUID()
  @IsOptional()
  partido_id?: string;

  @IsString()
  @IsOptional()
  @IsIn(['INTERNAS', 'GENERALES'])
  modo_eleccion?: 'INTERNAS' | 'GENERALES';
}