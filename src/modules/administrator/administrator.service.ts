import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAdministratorDto } from './dto/create-administrator.dto';
import { UpdateAdministratorDto } from './dto/update-administrator.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { envConfig } from 'src/config/env.config';
import { Administrator, Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { saltRounds } from 'src/constants/common.constants';
import { PasswordDto } from './dto/login-administrator.dto';
import * as jwt from 'jsonwebtoken';
import { CloudflareService } from 'src/lib/cloudflare.service';

@Injectable()
export class AdministratorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudflareService: CloudflareService,
  ) {}

  /**
   * API: Service
   * Message: Create - administrator
   */
  async create(createAdministratorDto: CreateAdministratorDto) {
    // hash the password
    createAdministratorDto.password = await bcrypt.hash(
      createAdministratorDto.password,
      saltRounds,
    );
    // create presignedurl to upload profile photo
    let uploadUrl: string | undefined;
    if (createAdministratorDto.profile_photo) {
      const result = await this.cloudflareService.getUploadUrl(
        createAdministratorDto.profile_photo,
      );
      createAdministratorDto.profile_photo = result.fileName;
      uploadUrl = result.uploadUrl;
    }
    const data = await this.prisma.administrator.create({
      data: createAdministratorDto,
    });
    return { ...data, uploadUrl };
  }

  /**
   * API: Service
   * Message: Password matcher - administrator
   */
  async isPasswordMatched(passwordDto: PasswordDto) {
    return await bcrypt.compare(
      passwordDto.inputPassword,
      passwordDto.currentPassword,
    );
  }
  /**
   * API: Service
   * Message: Token generator - administrator
   */
  createToken(
    payload: Partial<Administrator>,
    secret?: string,
    expiresIn?: number,
  ) {
    const token = jwt.sign(
      payload as jwt.JwtPayload,
      secret || envConfig.access_token_secret,
      { expiresIn: expiresIn || envConfig.access_token_expires_in },
    );
    return token;
  }

  /**
   * API: Service
   * Message: Get All - administrator
   */
  async findAll(query: Prisma.AdministratorFindManyArgs<DefaultArgs>) {
    const result = await this.prisma.administrator.findMany(query);
    // add presigned url for profile photos
    const administrators = await Promise.all(
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
    const total = await this.prisma.administrator.count({ where: query.where });
    return {
      total,
      administrators,
    };
  }

  /**
   * API: Service
   * Message: Get One - administrator
   */
  findOne(query: Prisma.AdministratorFindFirstOrThrowArgs) {
    return this.prisma.administrator.findFirst(query);
  }
  /**
   * API: Service
   * Message: Get Unique - administrator
   */
  findUnique(query: Prisma.AdministratorFindUniqueArgs) {
    return this.prisma.administrator.findUnique(query);
  }

  /**
   * API: Service
   * Message: Get Unique - administrator
   */
  async findUniqueWithPhoto(query: Prisma.AdministratorFindUniqueArgs) {
    const isExist = await this.prisma.administrator.findUnique(query);
    if (!isExist) {
      throw new NotFoundException('Administrator not found!');
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
   * Message: Update - administrator
   */
  async update(id: number, updateAdministratorDto: UpdateAdministratorDto) {
    const isExist = await this.findUnique({ where: { id } });
    if (!isExist) {
      throw new NotFoundException('Administrator not found!');
    }
    if (updateAdministratorDto.password) {
      updateAdministratorDto.password = await bcrypt.hash(
        updateAdministratorDto.password,
        saltRounds,
      );
    }

    if (updateAdministratorDto.email) {
      const isAlreadyExist = await this.findOne({
        where: { email: updateAdministratorDto.email },
      });
      if (isAlreadyExist) {
        throw new BadRequestException('Email already exists');
      }
    }

    let uploadUrl: string | undefined;
    if (updateAdministratorDto.profile_photo) {
      const result = await this.cloudflareService.getUploadUrl(
        updateAdministratorDto.profile_photo,
      );
      updateAdministratorDto.profile_photo = result.fileName;
      uploadUrl = result.uploadUrl;
      if (isExist.profile_photo) {
        await this.cloudflareService.deleteFile(isExist.profile_photo);
      }
    }

    const data = await this.prisma.administrator.update({
      where: { id },
      data: updateAdministratorDto,
    });
    return { ...data, uploadUrl };
  }

  /**
   * API: Service
   * Message: Delete - administrator
   */
  async remove(id: number) {
    return await this.prisma.$transaction(async (trx) => {
      const isExist = await trx.administrator.findUnique({ where: { id } });
      if (!isExist) {
        throw new NotFoundException('Administrator not found!');
      }
      if (isExist.profile_photo) {
        await this.cloudflareService.deleteFile(isExist.profile_photo);
      }
      await trx.administratorSession.deleteMany({
        where: {
          administrator_id: id,
        },
      });

      return this.prisma.administrator.delete({ where: { id } });
    });
  }
}
