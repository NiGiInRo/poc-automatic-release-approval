import { Controller, Get, Post, Body } from '@nestjs/common';
import { ReleasesService } from './releases.service';
import { CreateReleaseDto } from './create-release.dto';

@Controller('releases')
export class ReleasesController {
  constructor(private readonly releasesService: ReleasesService) {}

  @Post()
  create(@Body() dto: CreateReleaseDto) {
    return this.releasesService.create(dto);
  }

  @Get()
  findAll() {
    return this.releasesService.findAll();
  }
}
