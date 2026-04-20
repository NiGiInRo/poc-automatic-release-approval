import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { MailService } from './mail.service';

@Module({
  controllers: [NotificationsController],
  providers: [MailService],
})
export class NotificationsModule {}
