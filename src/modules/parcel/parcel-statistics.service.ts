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
    const phoneNumber = phone.replace('+88', '');
    if (phoneNumber.length !== 11) {
      throw new BadRequestException('Invalid phone number!');
    }
    if (!envConfig.courierUrl || !envConfig.courierKey) {
      throw new InternalServerErrorException(
        'Please contact with authority, there is an issue!',
      );
    }
    const res = await fetch(envConfig.courierUrl + '?phone=' + phoneNumber, {
      headers: {
        authorization: envConfig.courierKey,
      },
    });
    const data = await res.json();
    return { data, phoneNumber };
  }

  async upsert(createParcelDto: CreateParcelStatisticsDto) {
    const isExist = await this.findUnique({
      where: {
        phone_number_seller_id: {
          phone_number: createParcelDto.phone_number,
          seller_id: createParcelDto.seller_id,
        },
      },
    });
    let result;
    if (isExist) {
      result = await this.update({
        where: {
          phone_number_seller_id: {
            phone_number: createParcelDto.phone_number,
            seller_id: createParcelDto.seller_id,
          },
        },
        data: {
          request_no: {
            increment: 1,
          },
        },
      });
    } else {
      result = await this.prisma.parcel_statistics.create({
        data: createParcelDto,
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
