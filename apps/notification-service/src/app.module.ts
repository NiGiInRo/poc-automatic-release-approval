import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [AppController],
})
export class AppModule {}
