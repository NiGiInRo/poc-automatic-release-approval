import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotifyDto } from './dto/notify.dto';
import { MailService } from './mail.service';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly mailService: MailService) {}

  @Post('notify')
  @ApiOperation({ summary: 'Notifica al aprobador cuando un release falla las reglas' })
  @ApiResponse({ status: 201, description: 'Correo enviado o modo degradado activo' })
  @ApiResponse({ status: 400, description: 'Body inválido' })
  notify(@Body() dto: NotifyDto) {
    return this.mailService.sendNotification({
      to: dto.aprobadorEmail,
      equipo: dto.equipo,
      tipo: dto.tipo,
      descripcion: dto.descripcion,
      reglasFallidas: dto.reglasFallidas,
    });
  }
}
