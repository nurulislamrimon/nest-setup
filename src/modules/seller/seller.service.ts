import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { envConfig } from 'src/config/env.config';
import { Seller, Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { saltRounds } from 'src/constants/common.constants';
import * as jwt from 'jsonwebtoken';
import { SellerPasswordDto } from './dto/login-seller';

@Injectable()
export class SellerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSellerDto: CreateSellerDto) {
    createSellerDto.password = await bcrypt.hash(
      createSellerDto.password,
      saltRounds,
    );
    return this.prisma.seller.create({
      data: createSellerDto,
    });
  }

  async isPasswordMatched(passwordDto: SellerPasswordDto) {
    return await bcrypt.compare(
      passwordDto.inputPassword,
      passwordDto.currentPassword,
    );
  }

  createToken(payload: Partial<Seller>, secret?: string, expiresIn?: number) {
    const token = jwt.sign(
      payload as jwt.JwtPayload,
      secret || envConfig.access_token_secret,
      { expiresIn: expiresIn || envConfig.access_token_expires_in },
    );
    return token;
  }

  async findAll(query: Prisma.SellerFindManyArgs<DefaultArgs>) {
    const sellers = await this.prisma.seller.findMany(query);
    const total = await this.prisma.seller.count({ where: query.where });
    return {
      total,
      sellers,
    };
  }

  findOne(query: Prisma.SellerFindFirstOrThrowArgs) {
    return this.prisma.seller.findFirst(query);
  }

  findUnique(query: Prisma.SellerFindUniqueArgs) {
    return this.prisma.seller.findUnique(query);
  }

  async update(id: number, updateSellerDto: UpdateSellerDto) {
    if (updateSellerDto.password) {
      updateSellerDto.password = await bcrypt.hash(
        updateSellerDto.password,
        saltRounds,
      );
    }

    if (updateSellerDto.email) {
      const isExist = await this.findOne({
        where: { email: updateSellerDto.email },
      });
      if (isExist) {
        throw new BadRequestException('Email already exists');
      }
    }

    return this.prisma.seller.update({
      where: { id },
      data: updateSellerDto,
    });
  }

  remove(id: number) {
    return this.prisma.seller.delete({ where: { id } });
  }
}
