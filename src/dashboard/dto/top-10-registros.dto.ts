import { IsString, IsNumber } from 'class-validator';

export class Top10RegistrosDto {
  @IsString()
  id: string;

  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsString()
  perfil: string;

  @IsNumber()
  total_simpatizantes_registrados: number;
}