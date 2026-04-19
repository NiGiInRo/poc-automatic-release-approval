import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const config = new DocumentBuilder()
    .setTitle('Notification Service')
    .setDescription('Envía correos cuando un release falla las reglas')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('swagger/docs', app, SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT ?? 3004);
  console.log('notification-service running on port 3004');
}
bootstrap();
