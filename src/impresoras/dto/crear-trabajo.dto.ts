import { IsString, IsObject } from 'class-validator';

export class CrearTrabajoDto {
  @IsString()
  tipo: string;

  @IsObject()
  datos: Record<string, unknown>;
}