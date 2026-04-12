import { IsUUID } from 'class-validator';

export class ConfirmarPasajeroDto {
  @IsUUID()
  pasajero_id: string; // ID del registro PasajeroTransporte
}