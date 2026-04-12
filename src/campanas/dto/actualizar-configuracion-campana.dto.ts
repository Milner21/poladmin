import { IsBoolean, IsOptional } from 'class-validator';

export class ActualizarConfiguracionCampanaDto {
  @IsBoolean()
  @IsOptional()
  permitir_duplicados_simpatizantes?: boolean;

  @IsBoolean()
  @IsOptional()
  permitir_registro_manual_fuera_padron?: boolean;
}