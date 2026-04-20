import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsNumber, Min, Max, IsEmail } from 'class-validator';

export enum TipoRelease {
  RS = 'rs',
  FX = 'fx',
  CV = 'cv',
}

export class CreateReleaseDto {
  @ApiProperty({ example: '2026-04-19' })
  @IsString()
  @IsNotEmpty()
  fecha: string;

  @ApiProperty({ example: 'Equipo Pagos' })
  @IsString()
  @IsNotEmpty()
  equipo: string;

  @ApiProperty({ enum: TipoRelease, example: TipoRelease.FX })
  @IsEnum(TipoRelease)
  tipo: TipoRelease;

  @ApiProperty({ example: 'Corrección en módulo de transferencias' })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({ example: 'JIRA-123' })
  @IsString()
  @IsNotEmpty()
  pr_o_jira: string;

  @ApiProperty({ example: 85, minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  cobertura: number;

  @ApiProperty({ example: 'NestJS 11, Node 20' })
  @IsString()
  @IsNotEmpty()
  stack: string;

  @ApiProperty({ example: 'aprobador@empresa.com' })
  @IsEmail()
  aprobadorEmail: string;
}
