import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { CloudflareService } from 'src/lib/cloudflare.service';

@Injectable()
export class SellerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudflareService: CloudflareService,
  ) {}

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

  async remove(id: number) {
    return await this.prisma.$transaction(async (trx) => {
      const isExist = await trx.seller.findUnique({
        where: {
          id,
        },
      });
      if (!isExist) {
        throw new NotFoundException('Seller not found!');
      }
      if (isExist.profile_photo) {
        await this.cloudflareService.deleteFile(isExist.profile_photo);
      }
      await trx.sellerSession.deleteMany({
        where: {
          seller_id: id,
        },
      });

      return await trx.seller.delete({ where: { id } });
    });
  }

  async removeMany(query: Prisma.SellerDeleteManyArgs) {
    return this.prisma.$transaction(async (trx) => {
      const sellers = await trx.seller.findMany(query);

      for (const seller of sellers) {
        await trx.sellerSession.deleteMany({
          where: { seller_id: seller.id },
        });

        if (seller.profile_photo) {
          await this.cloudflareService.deleteFile(seller.profile_photo);
        }
      }

      return await trx.seller.deleteMany(query);
    });
  }
}
