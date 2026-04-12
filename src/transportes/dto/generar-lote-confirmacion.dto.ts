import { IsNotEmpty, IsString } from 'class-validator';

export class GenerarLoteConfirmacionDto {
  @IsString()
  @IsNotEmpty()
  transportista_id: string;
}