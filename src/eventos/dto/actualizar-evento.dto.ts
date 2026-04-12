import { IsString, IsOptional, IsDateString, IsInt, IsNumber, Min } from 'class-validator';

export class ActualizarEventoDto {
  @IsString()
  @IsOptional()
  titulo?: string;

  @IsDateString()
  @IsOptional()
  fecha_hora_inicio?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsNumber()
  @IsOptional()
  latitud?: number;

  @IsNumber()
  @IsOptional()
  longitud?: number;

  @IsString()
  @IsOptional()
  barrio?: string;

  @IsString()
  @IsOptional()
  ciudad?: string;

  @IsString()
  @IsOptional()
  tipo_evento?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  capacidad_estimada?: number;

  @IsString()
  @IsOptional()
  estado?: string;
}