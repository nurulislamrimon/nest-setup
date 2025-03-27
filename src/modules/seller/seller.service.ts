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

  /**
   * API: Service
   * Message: Create - seller
   */
  async create(createSellerDto: CreateSellerDto) {
    createSellerDto.password = await bcrypt.hash(
      createSellerDto.password,
      saltRounds,
    );
    // create presignedurl to upload profile photo
    let uploadUrl: string | undefined;
    if (createSellerDto.profile_photo) {
      const result = await this.cloudflareService.getUploadUrl(
        createSellerDto.profile_photo,
      );
      createSellerDto.profile_photo = result.fileName;
      uploadUrl = result.uploadUrl;
    }
    const data = await this.prisma.seller.create({
      data: createSellerDto,
    });
    return { ...data, uploadUrl };
  }

  /**
   * API: Service
   * Message: Password Matcher - seller
   */
  async isPasswordMatched(passwordDto: SellerPasswordDto) {
    return await bcrypt.compare(
      passwordDto.inputPassword,
      passwordDto.currentPassword,
    );
  }

  /**
   * API: Service
   * Message: Token Generator - seller
   */
  createToken(payload: Partial<Seller>, secret?: string, expiresIn?: number) {
    const token = jwt.sign(
      payload as jwt.JwtPayload,
      secret || envConfig.access_token_secret,
      { expiresIn: expiresIn || envConfig.access_token_expires_in },
    );
    return token;
  }

  /**
   * API: Service
   * Message: Get All - seller
   */
  async findAll(query: Prisma.SellerFindManyArgs<DefaultArgs>) {
    const result = await this.prisma.seller.findMany(query);
    // add presigned url for profile photos
    const sellers = await Promise.all(
      result.map(async (ad) => {
        if (ad.profile_photo) {
          const url = await this.cloudflareService.getDownloadUrl(
            ad.profile_photo,
          );
          return { ...ad, profile_photo_url: url };
        }
        return ad;
      }),
    );
    const total = await this.prisma.seller.count({ where: query.where });
    return {
      total,
      sellers,
    };
  }

  /**
   * API: Service
   * Message: Get One - seller
   */
  findOne(query: Prisma.SellerFindFirstOrThrowArgs) {
    return this.prisma.seller.findFirst(query);
  }

  /**
   * API: Service
   * Message: Get Unique - seller
   */
  findUnique(query: Prisma.SellerFindUniqueArgs) {
    return this.prisma.seller.findUnique(query);
  }

  /**
   * API: Service
   * Message: Get Unique - seller
   */
  async findUniqueWithPhoto(query: Prisma.SellerFindUniqueArgs) {
    const isExist = await this.prisma.seller.findUnique(query);
    if (!isExist) {
      throw new NotFoundException('Seller not found!');
    }

    let profile_photo_url: string | undefined;
    if (isExist.profile_photo) {
      profile_photo_url = await this.cloudflareService.getDownloadUrl(
        isExist.profile_photo,
      );
    }
    return { ...isExist, profile_photo_url };
  }

  /**
   * API: Service
   * Message: Update - seller
   */
  async update(id: number, updateSellerDto: UpdateSellerDto) {
    const isExist = await this.findUnique({ where: { id } });
    if (!isExist) {
      throw new NotFoundException('Seller not found!');
    }

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

    let uploadUrl: string | undefined;
    if (updateSellerDto.profile_photo) {
      const result = await this.cloudflareService.getUploadUrl(
        updateSellerDto.profile_photo,
      );
      updateSellerDto.profile_photo = result.fileName;
      uploadUrl = result.uploadUrl;
      if (isExist.profile_photo) {
        await this.cloudflareService.deleteFile(isExist.profile_photo);
      }
    }

    const data = await this.prisma.seller.update({
      where: { id },
      data: updateSellerDto,
    });
    return { ...data, uploadUrl };
  }

  /**
   * API: Service
   * Message: Delete - seller
   */
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

  /**
   * API: Service
   * Message: Delete Many - seller
   */
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
