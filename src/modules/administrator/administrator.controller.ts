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
import {
  ClientInfo,
  IClientInfo,
} from 'src/decorators/param/ClientInfo.decorator';
import { AdministratorSessionService } from '../administrator-session/administrator-session.service';
import { CloudflareService } from 'src/lib/cloudflare.service';

@Controller('administrators')
export class AdministratorController {
  constructor(
    private readonly administratorService: AdministratorService,
    private readonly administratorSessionService: AdministratorSessionService,
    private readonly cloudflareService: CloudflareService,
  ) {}

  @Post('add')
  @Roles('super_admin', 'admin')
  async create(@Body() createAdministratorDto: CreateAdministratorDto) {
    const isExist = await this.administratorService.findUnique({
      where: { email: createAdministratorDto.email },
    });
    if (isExist) {
      throw new BadRequestException('Administrator already exist');
    }
    let uploadUrl: string | undefined;
    if (createAdministratorDto.profilePhoto) {
      const result = await this.cloudflareService.getUploadUrl(
        createAdministratorDto.profilePhoto,
      );
      createAdministratorDto.profilePhoto = result.fileName;
      uploadUrl = result.uploadUrl;
    }
    const data = await this.administratorService.create(createAdministratorDto);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = data;
    return {
      message: 'Administrator created successfully',
      data: { ...rest, uploadUrl },
    };
  }

  @Post('login')
  @Public()
  async login(
    @Body() loginAdministratorDto: LoginAdministratorDto,
    @ClientInfo() clientInfo: IClientInfo,
  ): Promise<
    ApiResponse<{
      user: Omit<Administrator, 'password'> & {
        profilePhotoUrl: string | undefined;
      };

      accessToken: string;
    }>
  > {
    const isExist = await this.administratorService.findUnique({
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

    const administratorSessionData = {
      administrator_id: isExist.id,
      ...clientInfo,
    };

    const administratorSession = await this.administratorSessionService.create(
      administratorSessionData,
    );

    if (!administratorSession) {
      throw new BadRequestException('Failed to create session');
    }
    let profilePhotoUrl: string | undefined;
    if (isExist.profilePhoto) {
      profilePhotoUrl = await this.cloudflareService.getDownloadUrl(
        isExist.profilePhoto as string,
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = isExist;
    return {
      message: 'Administrator created successfully',
      data: {
        user: { ...rest, profilePhotoUrl },
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

    // add presigned url for profile photos
    const administrators = await Promise.all(
      data.administrators.map(async (ad) => {
        if (ad.profilePhoto) {
          const url = await this.cloudflareService.getDownloadUrl(
            ad.profilePhoto as string,
          );
          return { ...ad, profilePhotoUrl: url };
        }
        return ad;
      }),
    );

    return {
      message: 'Administrator retrived successfully',
      meta: {
        total: data.total,
        limit: Number(pagination.limit),
        page: Number(pagination.page),
      },
      data: administrators,
    };
  }

  @Get('me')
  async findMe(@Req() req: Request) {
    const user = req['user'] as Record<string, any>;
    const id = user?.id;
    const isExist = await this.administratorService.findUnique({
      where: { id: +id },
      select: administratorSelectedFields,
    });

    if (!isExist) {
      throw new NotFoundException("Administrator doen't exist!");
    }

    let profilePhotoUrl: string | undefined;
    if (isExist.profilePhoto) {
      profilePhotoUrl = await this.cloudflareService.getDownloadUrl(
        isExist.profilePhoto as string,
      );
    }

    return { data: { ...isExist, profilePhotoUrl } };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const isExist = await this.administratorService.findUnique({
      where: { id: +id },
      select: administratorSelectedFields,
    });
    if (!isExist) {
      throw new NotFoundException('Administrator not found');
    }

    let profilePhotoUrl: string | undefined;
    if (isExist.profilePhoto) {
      profilePhotoUrl = await this.cloudflareService.getDownloadUrl(
        isExist.profilePhoto as string,
      );
    }

    return { data: { ...isExist, profilePhotoUrl } };
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
    const isExist = await this.administratorService.findUnique({
      where: { id: +id },
    });
    if (!isExist) {
      throw new NotFoundException('Administrator not found');
    }
    let uploadUrl: string | undefined;
    if (updateAdministratorDto.profilePhoto) {
      // delete existing
      await this.cloudflareService.deleteFile(isExist.profilePhoto as string);
      // add new
      const result = await this.cloudflareService.getUploadUrl(
        updateAdministratorDto.profilePhoto,
      );
      updateAdministratorDto.profilePhoto = result.fileName;
      uploadUrl = result.uploadUrl;
    }
    const result = await this.administratorService.update(
      +id,
      updateAdministratorDto,
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = result;
    return { data: { ...rest, uploadUrl } };
  }

  @Patch(':id')
  @Roles('super_admin', 'admin')
  async updateById(
    @Param('id') id: string,
    @Body() updateAdministratorDto: UpdateAdministratorDto,
  ) {
    const isExist = await this.administratorService.findUnique({
      where: { id: +id },
    });

    if (!isExist) {
      throw new NotFoundException('Administrator not found');
    }
    let uploadUrl: string | undefined;
    if (updateAdministratorDto.profilePhoto) {
      // delete existing
      await this.cloudflareService.deleteFile(isExist.profilePhoto as string);
      // add new
      const result = await this.cloudflareService.getUploadUrl(
        updateAdministratorDto.profilePhoto,
      );
      updateAdministratorDto.profilePhoto = result.fileName;
      uploadUrl = result.uploadUrl;
    }
    const result = await this.administratorService.update(
      +id,
      updateAdministratorDto,
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = result;
    return { data: { ...rest, uploadUrl } };
  }

  @Delete(':id')
  @Roles('super_admin', 'admin')
  async remove(@Param('id') id: string) {
    const isExist = await this.administratorService.findUnique({
      where: { id: +id },
    });
    if (!isExist) throw new NotFoundException('Administrator not found');

    if (isExist.profilePhoto) {
      await this.cloudflareService.deleteFile(isExist.profilePhoto as string);
    }

    const data = await this.administratorService.remove(+id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = data;
    return { data: rest };
  }
}
