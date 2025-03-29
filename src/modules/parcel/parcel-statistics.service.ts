import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateParcelStatisticsDto } from './dto/create-parcel-statistics.dto';
import { Prisma, PrismaClient } from '@prisma/client';
import { envConfig } from 'src/config/env.config';

@Injectable()
export class ParcelStatisticsService {
  constructor(private readonly prisma: PrismaClient) {}

  async getStatisticsFromServer(phone: string) {
    const phoneFormed = phone.replace('+88', '');
    if (phoneFormed.length !== 11) {
      throw new BadRequestException('Invalid phone number!');
    }
    if (!envConfig.courierUrl || !envConfig.courierKey) {
      throw new InternalServerErrorException(
        'Please contact with authority, there is an issue!',
      );
    }
    const res = await fetch(envConfig.courierUrl + '?phone=' + phoneFormed, {
      headers: {
        authorization: envConfig.courierKey,
      },
    });
    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return data;
  }

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
