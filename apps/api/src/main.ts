import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.use('/assets', express.static(join(__dirname, '..', 'public')));
  app.setGlobalPrefix('api');
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const swagger = new DocumentBuilder()
    .setTitle('Mentis AI API')
    .setDescription('Faculty release API: auth, onboarding, focus, wellness, content, community and AI personalization.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swagger));

  const port = Number(config.get('PORT') || 4000);
  await app.listen(port, '0.0.0.0');
  console.log(`Mentis API running at http://localhost:${port}/api`);
  console.log(`Swagger at http://localhost:${port}/api/docs`);
}
bootstrap();
