import { IsOptional, IsString, IsDateString, IsIn } from 'class-validator';

export class FiltrosReporteDto {
  @IsString()
  @IsOptional()
  campana_id?: string;

  @IsDateString()
  @IsOptional()
  fecha_desde?: string;

  @IsDateString()
  @IsOptional()
  fecha_hasta?: string;

  @IsString()
  @IsOptional()
  departamento?: string;

  @IsString()
  @IsOptional()
  distrito?: string;

  @IsString()
  @IsOptional()
  barrio?: string;

  @IsString()
  @IsOptional()
  candidato_id?: string;

  @IsString()
  @IsOptional()
  lider_id?: string;

  @IsString()
  @IsIn(['dia', 'semana', 'mes'])
  @IsOptional()
  agrupacion?: 'dia' | 'semana' | 'mes';
}