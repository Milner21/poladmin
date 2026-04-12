import { IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export class CambiarPasswordDto {
  @IsString()
  @MinLength(6)
  @ValidateIf((o) => o.password_actual !== undefined && o.password_actual !== null)
  @IsOptional()
  password_actual: string;

  @IsString()
  @MinLength(6)
  password_nuevo: string;
}