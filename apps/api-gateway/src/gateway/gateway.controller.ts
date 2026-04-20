import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GatewayService } from './gateway.service';
import { CreateReleaseDto } from './dto/create-release.dto';

@ApiTags('gateway')
@Controller('gateway')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @ApiOperation({ summary: 'Listar todas las solicitudes de release' })
  @Get('releases')
  getReleases() {
    return this.gatewayService.getReleases();
  }

  @ApiOperation({ summary: 'Crear solicitud de release (orquesta el flujo completo)' })
  @Post('releases')
  createRelease(@Body() dto: CreateReleaseDto) {
    return this.gatewayService.createRelease(dto);
  }
}
