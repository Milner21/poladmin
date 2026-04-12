import { IsString, IsNotEmpty, IsDateString, IsOptional, IsInt, IsNumber, Min } from 'class-validator';

export class CrearEventoDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsDateString()
  @IsNotEmpty()
  fecha_hora_inicio: string;

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
  @IsNotEmpty()
  candidato_id: string;

  @IsString()
  @IsNotEmpty()
  tipo_evento: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  capacidad_estimada?: number;
}