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
import { CreateAdministratorDto } from './dto/create-administrator.dto';
import { UpdateAdministratorDto } from './dto/update-administrator.dto';
import { ApiResponse } from 'src/interceptors/response.interceptor';
import { LoginAdministratorDto } from './dto/login-administrator.dto';
import { Administrator } from '@prisma/client';
import { Request } from 'express';
import {
  administratorFilterableFields,
  administratorSearchableFields,
  administratorSelectedFields,
} from './administrator.constants';
import { AdministratorService } from './administrator.service';
import { Roles } from 'src/decorators/Roles.decorator';
import { Public } from 'src/decorators/public.decorator';
import { SearchFilterAndPaginationInterceptor } from 'src/interceptors/searchFilterAndPagination.interceptor';
import { formatPagination } from 'src/utils/format.utils';

@Controller('administrators')
export class AdministratorController {
  constructor(private readonly administratorService: AdministratorService) {}

  @Post('add')
  @Roles('super_admin', 'admin')
  async create(@Body() createAdministratorDto: CreateAdministratorDto) {
    const data = await this.administratorService.create(createAdministratorDto);
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
    const isExist = await this.administratorService.findOne({
      where: { email: loginAdministratorDto.email },
    });

    if (!isExist) {
      throw new NotFoundException('Administrator not found');
    }

    const isPasswordMatched = await this.administratorService.isPasswordMatched(
      {
        inputPassword: loginAdministratorDto.password,
        currentPassword: isExist.password,
      },
    );

    if (!isPasswordMatched) {
      throw new BadRequestException('Invalid credentials!');
    }

    const accessToken = this.administratorService.createToken({
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
  @Roles('super_admin', 'admin', 'manager')
  @UseInterceptors(
    new SearchFilterAndPaginationInterceptor<'Administrator'>(
      administratorSearchableFields,
      administratorFilterableFields,
    ),
  )
  async findAll(@Req() req: Request) {
    const where = req['where'];
    const pagination = req['pagination'] as Record<string, string | number>;

    const data = await this.administratorService.findAll({
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

  @Get('me')
  async findMe(@Req() req: Request) {
    const user = req['user'] as Record<string, any>;
    const id = user?.id;
    const data = await this.administratorService.findOne({
      where: { id: +id },
      select: administratorSelectedFields,
    });
    return { data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.administratorService.findOne({
      where: { id: +id },
      select: administratorSelectedFields,
    });
    return { data };
  }

  @Patch('update')
  async updateMe(
    @Body() updateAdministratorDto: UpdateAdministratorDto,
    @Req() req: Request,
  ) {
    const user = req['user'] as Record<string, any>;
    const id = user?.id;
    if (updateAdministratorDto.role) {
      throw new BadRequestException('You can not change your role');
    }
    const isExist = await this.administratorService.findOne({
      where: { id: +id },
    });
    if (!isExist) {
      throw new NotFoundException('Administrator not found');
    }
    const result = await this.administratorService.update(
      +id,
      updateAdministratorDto,
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = result;
    return { data: rest };
  }

  @Patch(':id')
  @Roles('super_admin', 'admin')
  async update(
    @Param('id') id: string,
    @Body() updateAdministratorDto: UpdateAdministratorDto,
  ) {
    const isExist = await this.administratorService.findOne({
      where: { id: +id },
    });

    if (!isExist) {
      throw new NotFoundException('Administrator not found');
    }

    const result = await this.administratorService.update(
      +id,
      updateAdministratorDto,
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = result;
    return { data: rest };
  }

  @Delete(':id')
  @Roles('super_admin', 'admin')
  async remove(@Param('id') id: string) {
    const isExist = await this.administratorService.findOne({
      where: { id: +id },
    });
    if (!isExist) throw new NotFoundException('Administrator not found');
    const data = await this.administratorService.remove(+id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = data;
    return { data: rest };
  }
}
