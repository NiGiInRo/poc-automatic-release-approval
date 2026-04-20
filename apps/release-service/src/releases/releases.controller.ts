import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReleasesService } from './releases.service';
import { CreateReleaseDto } from './create-release.dto';

@ApiTags('releases')
@Controller('releases')
export class ReleasesController {
  constructor(private readonly releasesService: ReleasesService) {}

  @ApiOperation({ summary: 'Crear una solicitud de release' })
  @Post()
  create(@Body() dto: CreateReleaseDto) {
    return this.releasesService.create(dto);
  }

  @ApiOperation({ summary: 'Listar todas las solicitudes de release' })
  @Get()
  findAll() {
    return this.releasesService.findAll();
  }
}
