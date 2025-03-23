import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envConfig } from './config/env.config';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ResponseInterceptor } from './interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // cors controller

  // cors controlle
  const allowedOrigins = envConfig.client_url?.split(',') || [
    'http://localhost:3000',
  ];
  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // static repository
  app.useStaticAssets(join(__dirname, '..', 'public'));
  // api versioning
  app.setGlobalPrefix('api/v1');

  // validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  // response format
  app.useGlobalInterceptors(new ResponseInterceptor());

  // listen app
  await app.listen(envConfig.port);
}
void bootstrap();
