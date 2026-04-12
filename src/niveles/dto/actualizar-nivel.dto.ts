import { IsString, IsOptional, IsInt, IsBoolean, Min } from 'class-validator';

export class ActualizarNivelDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  orden?: number;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsBoolean()
  @IsOptional()
  permite_operadores?: boolean;

  @IsBoolean()
  @IsOptional()
  exclusivo_root?: boolean; 

  @IsBoolean()
  @IsOptional()
  estado?: boolean;
}