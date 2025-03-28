import { Module } from '@nestjs/common';
import { ParcelStatisticsService } from './parcel-statistics.service';
import { ParcelStatisticsController } from './parcel-statistics.controller';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [ParcelStatisticsController],
  providers: [ParcelStatisticsService, PrismaClient],
  exports: [PrismaClient],
})
export class ParcelStatisticsModule {}
