import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class ActualizarPartidoDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nombre?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  sigla?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  descripcion?: string;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;
}