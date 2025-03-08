import { Injectable } from '@nestjs/common';
import { CreateAdministratorDto } from './dto/create-administrator.dto';
import { UpdateAdministratorDto } from './dto/update-administrator.dto';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Administrator } from './entities/administrator.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as jwt from 'jsonwebtoken';

import { PasswordDto } from './dto/login-administrator.dto';
import * as bcrypt from 'bcrypt';
import { envConfig } from 'src/config/env.config';

@Injectable()
export class AdministratorsService {
  constructor(
    @InjectRepository(Administrator)
    private readonly administratorsRepository: Repository<Administrator>,
  ) {}

  create(createAdministratorDto: CreateAdministratorDto) {
    createAdministratorDto.failed_attemp_ip = [];
    const administrator = this.administratorsRepository.create(
      createAdministratorDto,
    );
    return this.administratorsRepository.save(administrator);
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

  async findAll(query: FindManyOptions<Administrator>) {
    const administrators = await this.administratorsRepository.find(query);
    const total = await this.administratorsRepository.count({});
    return {
      total,
      administrators,
    };
  }

  findOne(query: FindOneOptions<Administrator>) {
    return this.administratorsRepository.findOne(query);
  }

  update(id: number, updateAdministratorDto: UpdateAdministratorDto) {
    return this.administratorsRepository.update(id, updateAdministratorDto);
  }

  remove(id: number) {
    return this.administratorsRepository.delete(id);
  }
}
