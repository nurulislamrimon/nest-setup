/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAdministratorSessionDto } from './dto/create-administrator.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdministratorSessionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAdministratorSessionDto: CreateAdministratorSessionDto) {
    const result = await this.prisma.administratorSession.create({
      data: createAdministratorSessionDto,
    });
    return result;
  }

  async update(data: Prisma.AdministratorSessionUpdateArgs) {
    const result = await this.prisma.administratorSession.update(data);
    return result;
  }

  async findAll(query: Prisma.AdministratorSessionFindManyArgs) {
    const data = await this.prisma.administratorSession.findMany(query);
    const total = await this.prisma.administratorSession.count({
      where: query.where,
    });
    return {
      total,
      data,
    };
  }

  async findOne(query: Prisma.AdministratorSessionFindFirstArgs) {
    const data = await this.prisma.administratorSession.findFirst(query);
    return data;
  }

  async findUnique(query: Prisma.AdministratorSessionFindUniqueArgs) {
    const data = await this.prisma.administratorSession.findUnique(query);
    return data;
  }

  async delete(query: Prisma.AdministratorSessionDeleteArgs) {
    const data = await this.prisma.administratorSession.delete(query);
    return data;
  }
}
