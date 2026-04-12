import { IsString, IsNotEmpty } from 'class-validator';

export class CrearDireccionDto {
  @IsString()
  @IsNotEmpty()
  departamento: string;

  @IsString()
  @IsNotEmpty()
  ciudad: string;

  @IsString()
  @IsNotEmpty()
  barrio: string;
}