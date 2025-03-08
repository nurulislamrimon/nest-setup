import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { GlobalExceptionFilter } from './HttpExceptionFilters/exception.filter';
import { envConfig } from './config/env.config';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

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
  // error format
  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(envConfig.port);
}
void bootstrap();
