import { Injectable } from '@nestjs/common';
import { CreateAdministratorDto } from './dto/create-administrator.dto';
import { UpdateAdministratorDto } from './dto/update-administrator.dto';
import * as jwt from 'jsonwebtoken';

import { PasswordDto } from './dto/login-administrator.dto';
import * as bcrypt from 'bcrypt';
import { envConfig } from 'src/config/env.config';
import { Administrator, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { saltRounds } from 'src/constants';
import { DefaultArgs } from '@prisma/client/runtime/library';

@Injectable()
export class AdministratorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAdministratorDto: CreateAdministratorDto) {
    createAdministratorDto.password = await bcrypt.hash(
      createAdministratorDto.password,
      saltRounds,
    );
    return this.prisma.administrator.create({
      data: createAdministratorDto,
    });
  }

  async isPasswordMatched(passwordDto: PasswordDto) {
    return await bcrypt.compare(
      passwordDto.inputPassword,
      passwordDto.currentPassword,
    );
  }

  createToken(
    payload: Partial<Administrator>,
    secret?: string,
    expiresIn?: string,
  ) {
    const token = jwt.sign(payload, secret || envConfig.access_token_secret, {
      expiresIn: expiresIn || envConfig.access_token_expires_in,
    });
    return token;
  }

  async findAll(query: Prisma.AdministratorFindManyArgs<DefaultArgs>) {
    const administrators = await this.prisma.administrator.findMany(query);
    const total = await this.prisma.administrator.count({});
    return {
      total,
      administrators,
    };
  }

  findOne(query: Prisma.AdministratorFindFirstOrThrowArgs) {
    return this.prisma.administrator.findFirst(query);
  }

  async update(id: number, updateAdministratorDto: UpdateAdministratorDto) {
    if (updateAdministratorDto.password) {
      updateAdministratorDto.password = await bcrypt.hash(
        updateAdministratorDto.password,
        saltRounds,
      );
    }

    return this.prisma.administrator.update({
      where: { id },
      data: updateAdministratorDto,
    });
  }

  remove(id: number) {
    return this.prisma.administrator.delete({ where: { id } });
  }
}
