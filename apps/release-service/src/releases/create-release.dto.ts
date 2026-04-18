import { IsString, IsNotEmpty, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { TipoRelease } from './release.entity';

export class CreateReleaseDto {
  @IsString()
  @IsNotEmpty()
  fecha: string;

  @IsString()
  @IsNotEmpty()
  equipo: string;

  @IsEnum(TipoRelease)
  tipo: TipoRelease;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsString()
  @IsNotEmpty()
  pr_o_jira: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  cobertura: number;

  @IsString()
  @IsNotEmpty()
  stack: string;
}
