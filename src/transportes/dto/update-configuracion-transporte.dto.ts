import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateConfiguracionTransporteDto {
  @IsBoolean()
  @IsOptional()
  permitir_impresion_tickets?: boolean;

  @IsBoolean()
  @IsOptional()
  permitir_duplicados?: boolean;
}