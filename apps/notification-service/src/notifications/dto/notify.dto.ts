import { IsArray, IsEmail, IsString, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NotifyDto {
  @ApiProperty({ example: 'Equipo Pagos' })
  @IsString()
  equipo: string;

  @ApiProperty({ example: 'aprobador@empresa.com' })
  @IsEmail()
  aprobadorEmail: string;

  @ApiProperty({ example: 'rs' })
  @IsString()
  tipo: string;

  @ApiProperty({ example: 'Agrega módulo de pagos' })
  @IsString()
  descripcion: string;

  @ApiProperty({ example: ['cobertura insuficiente (60 < 80)', 'PR no encontrado'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  reglasFallidas: string[];
}
