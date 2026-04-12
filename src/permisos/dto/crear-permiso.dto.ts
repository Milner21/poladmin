import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CrearPermisoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsNotEmpty()
  modulo: string;

  @IsString()
  @IsNotEmpty()
  accion: string;
}
