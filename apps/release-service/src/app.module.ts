import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { Release } from './releases/release.entity';
import { ReleasesModule } from './releases/releases.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'releases.sqlite',
      entities: [Release],
      synchronize: true,
    }),
    ReleasesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
