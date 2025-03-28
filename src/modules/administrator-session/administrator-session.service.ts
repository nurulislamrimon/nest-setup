import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateAdministratorSessionDto } from './dto/create-administrator-session.dto';

@Injectable()
export class AdministratorSessionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * API: Service
   * Message: Create - administrator-session
   */
  async create(createAdministratorSessionDto: CreateAdministratorSessionDto) {
    const result = await this.prisma.administratorSession.create({
      data: createAdministratorSessionDto,
    });
    return result;
  }

  /**
   * API: Service
   * Message: Update - administrator-session
   */
  async update(data: Prisma.AdministratorSessionUpdateArgs) {
    const result = await this.prisma.administratorSession.update(data);
    return result;
  }

  /**
   * API: Service
   * Message: Get All - administrator-session
   */
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

  /**
   * API: Service
   * Message: Get One - administrator-session
   */
  async findOne(query: Prisma.AdministratorSessionFindFirstArgs) {
    const data = await this.prisma.administratorSession.findFirst(query);
    return data;
  }

  /**
   * API: Service
   * Message: Get Unique - administrator-session
   */
  async findUnique(query: Prisma.AdministratorSessionFindUniqueArgs) {
    const data = await this.prisma.administratorSession.findUnique(query);
    return data;
  }

  /**
   * API: Service
   * Message: Delete - administrator-session
   */
  async remove(query: Prisma.AdministratorSessionDeleteArgs) {
    const data = await this.prisma.administratorSession.delete(query);
    return data;
  }
}
