import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GatewayService } from './gateway.service';
import { CreateReleaseDto } from './dto/create-release.dto';

@ApiTags('gateway')
@ApiBearerAuth()
@Controller('gateway')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @ApiOperation({ summary: 'Listar todas las solicitudes de release' })
  @ApiResponse({ status: 200, description: 'Lista de releases persistidos' })
  @Get('releases')
  getReleases() {
    return this.gatewayService.getReleases();
  }

  @ApiOperation({ summary: 'Crear solicitud de release — orquesta el flujo completo' })
  @ApiBody({ type: CreateReleaseDto })
  @ApiResponse({ status: 201, description: 'Release persistido con su estado final (APROBADO o PENDIENTE)' })
  @ApiResponse({ status: 400, description: 'Body inválido' })
  @ApiResponse({ status: 502, description: 'Error al comunicarse con el release-service' })
  @Post('releases')
  createRelease(@Body() dto: CreateReleaseDto) {
    return this.gatewayService.createRelease(dto);
  }
}
