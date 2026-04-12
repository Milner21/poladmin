import { IsString, IsNumber } from 'class-validator';

export class DistribucionRedItemDto {
  @IsString()
  rol: string; // valor de Perfil.nombre

  @IsString()
  rol_nombre: string; // para frontend (usamos el mismo Perfil.nombre)

  @IsNumber()
  total: number;
}