import { Injectable } from '@nestjs/common';
import { CreateParcelStatisticsDto } from './dto/create-parcel-statistics.dto';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class ParcelStatisticsService {
  constructor(private readonly prisma: PrismaClient) {}

  async create(createParcelDto: CreateParcelStatisticsDto) {
    const result = await this.prisma.parcel_statistics.create({
      data: createParcelDto,
    });
    return result;
  }

  async findAll(query: Prisma.Parcel_statisticsFindManyArgs) {
    const data = await this.prisma.parcel_statistics.findMany(query);
    const total = await this.prisma.parcel_statistics.count({
      where: query.where,
    });
    return {
      data,
      total,
    };
  }

  async findUnique(query: Prisma.Parcel_statisticsFindUniqueArgs) {
    return await this.prisma.parcel_statistics.findUnique(query);
  }

  async findOne(query: Prisma.Parcel_statisticsFindFirstArgs) {
    return await this.prisma.parcel_statistics.findFirst(query);
  }

  async update(data: Prisma.Parcel_statisticsUpdateArgs) {
    return await this.prisma.parcel_statistics.update(data);
  }

  async remove(query: Prisma.Parcel_statisticsDeleteArgs) {
    return await this.prisma.parcel_statistics.delete(query);
  }
}
