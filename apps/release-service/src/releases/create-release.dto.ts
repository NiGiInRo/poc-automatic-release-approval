import { IsString, IsNotEmpty, IsEnum, IsNumber, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoRelease, EstadoRelease, AprobacionRelease } from './release.entity';

export class CreateReleaseDto {
  @ApiProperty({ example: '2026-04-18' })
  @IsString()
  @IsNotEmpty()
  fecha: string;

  @ApiProperty({ example: 'Equipo Pagos' })
  @IsString()
  @IsNotEmpty()
  equipo: string;

  @ApiProperty({ enum: TipoRelease, example: TipoRelease.RS })
  @IsEnum(TipoRelease)
  tipo: TipoRelease;

  @ApiProperty({ example: 'Nueva funcionalidad de transferencias' })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({ example: 'https://github.com/org/repo/pull/1' })
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

  @ApiPropertyOptional({ enum: EstadoRelease })
  @IsOptional()
  @IsEnum(EstadoRelease)
  estado?: EstadoRelease;

  @ApiPropertyOptional({ enum: AprobacionRelease })
  @IsOptional()
  @IsEnum(AprobacionRelease)
  aprobacion?: AprobacionRelease;
}
