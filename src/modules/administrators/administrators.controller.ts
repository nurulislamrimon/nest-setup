import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AdministratorsService } from './administrators.service';
import { CreateAdministratorDto } from './dto/create-administrator.dto';
import { UpdateAdministratorDto } from './dto/update-administrator.dto';
import { ApiResponse } from 'src/interceptors/response.interceptor';
import { LoginAdministratorDto } from './dto/login-administrator.dto';
import { Public } from 'src/decorators/public.decorator';
import { Administrator } from '@prisma/client';

@Controller('administrators')
export class AdministratorsController {
  constructor(private readonly administratorsService: AdministratorsService) {}

  @Post('add')
  @Public()
  async create(@Body() createAdministratorDto: CreateAdministratorDto) {
    const data = await this.administratorsService.create(
      createAdministratorDto,
    );
    return {
      message: 'Administrator created successfully',
      data,
    };
  }

  @Post('login')
  async login(
    @Body() loginAdministratorDto: LoginAdministratorDto,
  ): Promise<ApiResponse<{ user: Administrator; accessToken: string }>> {
    const isExist = await this.administratorsService.findOne({
      where: { email: loginAdministratorDto.email },
    });

    if (!isExist) {
      throw new NotFoundException('Administrator not found');
    }

    const isPasswordMatched =
      await this.administratorsService.isPasswordMatched({
        inputPassword: loginAdministratorDto.password,
        currentPassword: isExist.password,
      });

    if (!isPasswordMatched) {
      throw new BadRequestException('Invalid credentials!');
    }

    const accessToken = this.administratorsService.createToken({
      id: isExist.id,
      email: isExist.email,
      role: isExist.role,
    });

    return {
      message: 'Administrator created successfully',
      data: {
        user: isExist,
        accessToken,
      },
    };
  }

  @Get()
  @Public()
  async findAll() {
    const data = await this.administratorsService.findAll({});
    return {
      message: 'Administrator retrived successfully',
      meta: { total: data.total, limit: 10, page: 1 },
      data: data.administrators,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.administratorsService.findOne({
      where: { id: +id },
    });
    return { data };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAdministratorDto: UpdateAdministratorDto,
  ) {
    const data = await this.administratorsService.update(
      +id,
      updateAdministratorDto,
    );
    return { data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const isExist = await this.administratorsService.findOne({
      where: { id: +id },
    });
    if (!isExist) throw new NotFoundException('Administrator not found');
    const data = await this.administratorsService.remove(+id);
    return { data };
  }
}
