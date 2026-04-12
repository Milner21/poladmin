import { IsString, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class EventoRecienteCreatorDto {
  @IsString()
  id: string;

  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsString()
  rol: string; // Perfil.nombre del creador
}

export class EventoRecienteItemDto {
  @IsString()
  id: string;

  @IsString()
  nombre: string; // mapeamos desde Evento.titulo

  @IsString()
  lugar: string; // mapeamos desde Evento.direccion (puede ser '' si no existe)

  @IsString()
  fecha: string; // YYYY-MM-DD

  @IsString()
  hora: string; // HH:mm

  @IsNumber()
  total_asistencias: number;

  @ValidateNested()
  @Type(() => EventoRecienteCreatorDto)
  creado_por: EventoRecienteCreatorDto;

  @IsString()
  fecha_registro: string; // ISO 8601
}