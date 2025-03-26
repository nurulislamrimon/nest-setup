import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateSellerSessionDto } from './dto/create-seller-session.dto';

@Injectable()
export class SellerSessionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSellerSessionDto: CreateSellerSessionDto) {
    const result = await this.prisma.sellerSession.create({
      data: createSellerSessionDto,
    });
    return result;
  }

  async update(data: Prisma.SellerSessionUpdateArgs) {
    const result = await this.prisma.sellerSession.update(data);
    return result;
  }

  async findAll(query: Prisma.SellerSessionFindManyArgs) {
    const data = await this.prisma.sellerSession.findMany(query);
    const total = await this.prisma.sellerSession.count({
      where: query.where,
    });
    return {
      total,
      data,
    };
  }

  async findOne(query: Prisma.SellerSessionFindFirstArgs) {
    const data = await this.prisma.sellerSession.findFirst(query);
    return data;
  }

  async findUnique(query: Prisma.SellerSessionFindUniqueArgs) {
    const data = await this.prisma.sellerSession.findUnique(query);
    return data;
  }

  async remove(query: Prisma.SellerSessionDeleteArgs) {
    const data = await this.prisma.sellerSession.delete(query);
    return data;
  }
}
