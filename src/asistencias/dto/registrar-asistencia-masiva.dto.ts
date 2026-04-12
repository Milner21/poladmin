import { IsUUID, IsNotEmpty, IsArray } from 'class-validator';

export class RegistrarAsistenciaMasivaDto {
  @IsUUID()
  @IsNotEmpty()
  evento_id: string;

  @IsArray()
  @IsUUID('4', { each: true })
  simpatizantes_ids: string[];
}