import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './interceptors/exception.interceptor';
import { PrismaExceptionFormatter } from './ExceptionsFormatter/prisma.exceptions';
import { DtoValidationFormatter } from './ExceptionsFormatter/dto.exceptions';
import { OtherExceptionFormatter } from './ExceptionsFormatter/other.exceptions';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // env configuration ==============
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
    }),
    // db module ==============
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaExceptionFormatter,
    DtoValidationFormatter,
    OtherExceptionFormatter,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
