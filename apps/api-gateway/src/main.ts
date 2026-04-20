import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const config = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription('Punto de entrada único para el flujo de aprobación de releases')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log('api-gateway running on port 3000');
  console.log('Swagger docs: http://localhost:3000/swagger/docs');
}
bootstrap();
