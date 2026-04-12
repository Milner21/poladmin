import { IsBoolean, IsOptional } from 'class-validator';

export class ActualizarAsistenciaDto {
  @IsBoolean()
  @IsOptional()
  confirmado_previamente?: boolean;

  @IsBoolean()
  @IsOptional()
  asistio?: boolean;
}