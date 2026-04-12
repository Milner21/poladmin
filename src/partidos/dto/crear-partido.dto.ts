import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CrearPartidoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  sigla: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  descripcion?: string;
}