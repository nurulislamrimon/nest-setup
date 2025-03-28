import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateSellerSessionDto } from './dto/create-seller-session.dto';

@Injectable()
export class SellerSessionService {
  constructor(private readonly prisma: PrismaService) {}
  /**
   * API: Service
   * Message: Create - seller-session
   */
  async create(createSellerSessionDto: CreateSellerSessionDto) {
    const result = await this.prisma.sellerSession.create({
      data: createSellerSessionDto,
    });
    return result;
  }

  /**
   * API: Service
   * Message: Update - seller-session
   */
  async update(data: Prisma.SellerSessionUpdateArgs) {
    const result = await this.prisma.sellerSession.update(data);
    return result;
  }

  /**
   * API: Service
   * Message: Get All - seller-session
   */
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

  /**
   * API: Service
   * Message: Get One - seller-session
   */
  async findOne(query: Prisma.SellerSessionFindFirstArgs) {
    const data = await this.prisma.sellerSession.findFirst(query);
    return data;
  }

  /**
   * API: Service
   * Message: Get Unique - seller-session
   */
  async findUnique(query: Prisma.SellerSessionFindUniqueArgs) {
    const data = await this.prisma.sellerSession.findUnique(query);
    return data;
  }

  /**
   * API: Service
   * Message: Delete - seller-session
   */
  async remove(query: Prisma.SellerSessionDeleteArgs) {
    const data = await this.prisma.sellerSession.delete(query);
    return data;
  }
}
