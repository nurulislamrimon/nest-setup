import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GlobalExceptionFilter } from './interceptors/exception.interceptor';
import { PrismaExceptionFormatter } from './ExceptionsFormatter/prisma.exceptions';
import { DtoValidationFormatter } from './ExceptionsFormatter/dto.exceptions';
import { OtherExceptionFormatter } from './ExceptionsFormatter/other.exceptions';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AdministratorModule } from './modules/administrator/administrator.module';
import { RolesGuard } from './guards/RoleGuard';
import { JwtAuthGuard } from './guards/JwtAuthGuards';

@Module({
  imports: [
    // env configuration ==============
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
    }),
    // db module ==============
    PrismaModule,
    // modules ==================
    AdministratorModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // guards ======================
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // exception formatter ==============
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
