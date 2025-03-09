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
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { AdministratorsService } from './administrators.service';
import { CreateAdministratorDto } from './dto/create-administrator.dto';
import { UpdateAdministratorDto } from './dto/update-administrator.dto';
import { ApiResponse } from 'src/interceptors/response.interceptor';
import { LoginAdministratorDto } from './dto/login-administrator.dto';
import { Public } from 'src/decorators/public.decorator';
import { Administrator } from '@prisma/client';
import { SearchFilterAndPaginationInterceptor } from 'src/interceptors/searchFilterAndPagination.interceptor';
import { Request } from 'express';
import { formatPagination } from 'src/utils/format.utils';
import {
  administratorFilterableFields,
  administratorSearchableFields,
  administratorSelectedFields,
} from './administrators.constants';

@Controller('administrators')
export class AdministratorsController {
  constructor(private readonly administratorsService: AdministratorsService) {}

  @Post('add')
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
  @Public()
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
  @UseInterceptors(
    new SearchFilterAndPaginationInterceptor(
      administratorSearchableFields,
      administratorFilterableFields,
    ),
  )
  async findAll(@Req() req: Request) {
    const where = req['where'];
    const pagination = req['pagination'] as Record<string, string | number>;

    const data = await this.administratorsService.findAll({
      where,
      select: administratorSelectedFields,
      ...formatPagination(pagination),
    });

    return {
      message: 'Administrator retrived successfully',
      meta: {
        total: data.total,
        limit: Number(pagination.limit),
        page: Number(pagination.page),
      },
      data: data.administrators,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.administratorsService.findOne({
      where: { id: +id },
      select: administratorSelectedFields,
    });
    return { data };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAdministratorDto: UpdateAdministratorDto,
  ) {
    const isExist = await this.administratorsService.findOne({
      where: { id: +id },
    });
    if (!isExist) {
      throw new NotFoundException('Administrator not found');
    }
    const result = await this.administratorsService.update(
      +id,
      updateAdministratorDto,
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = result;
    return { data: rest };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const isExist = await this.administratorsService.findOne({
      where: { id: +id },
    });
    if (!isExist) throw new NotFoundException('Administrator not found');
    const data = await this.administratorsService.remove(+id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = data;
    return { data: rest };
  }
}
