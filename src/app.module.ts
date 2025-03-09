import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AdministratorsModule } from './modules/administrators/administrators.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/JwtAuthGuard';
import { PrismaModule } from './modules/prisma/prisma.module';
import { RolesGuard } from './guards/RoleGuard';

@Module({
  imports: [
    // env configuration ==============
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
    }),
    // db module ==============
    PrismaModule,
    // modules ==============
    AdministratorsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    AppService,
  ],
})
export class AppModule {}
