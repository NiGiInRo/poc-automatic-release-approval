import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  health() {
    return { service: 'rules-service', status: 'ok' };
  }
}
