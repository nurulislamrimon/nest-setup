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
import { LoginAdministratorDto } from './dto/login-administrator.dto';
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
import { AdministratorRoleEnum } from 'src/constants/enum.constants';

@Controller('administrators')
export class AdministratorController {
  constructor(
    private readonly administratorService: AdministratorService,
    private readonly administratorSessionService: AdministratorSessionService,
    private readonly cloudflareService: CloudflareService,
  ) {}

  /**
   * API: Controller
   * Message: Create - administrator
   */
  @Post('add')
  @Roles(AdministratorRoleEnum.SUPER_ADMIN, AdministratorRoleEnum.ADMIN)
  async create(@Body() createAdministratorDto: CreateAdministratorDto) {
    const isExist = await this.administratorService.findUnique({
      where: { email: createAdministratorDto.email },
    });
    if (isExist) {
      throw new BadRequestException('Administrator already exist');
    }
    const data = await this.administratorService.create(createAdministratorDto);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = data;
    return {
      message: 'Administrator created successfully',
      data: { ...rest },
    };
  }

  /**
   * API: Controller
   * Message: Login - administrator
   */
  @Post('login')
  @Public()
  async login(
    @Body() loginAdministratorDto: LoginAdministratorDto,
    @ClientInfo() clientInfo: IClientInfo,
  ) {
    const isExist = await this.administratorService.findUnique({
      where: { email: loginAdministratorDto.email, is_active: true },
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
    let profile_photo_url: string | undefined;
    if (isExist.profile_photo) {
      profile_photo_url = await this.cloudflareService.getDownloadUrl(
        isExist.profile_photo,
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = isExist;
    return {
      message: 'Administrator created successfully',
      data: {
        user: { ...rest, profile_photo_url },
        accessToken,
      },
    };
  }

  /**
   * API: Controller
   * Message: Get All - administrator
   */
  @Get()
  @Roles(
    AdministratorRoleEnum.SUPER_ADMIN,
    AdministratorRoleEnum.ADMIN,
    AdministratorRoleEnum.MANAGER,
  )
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

  /**
   * API: Controller
   * Message: Get Me - administrator
   */
  @Get('me')
  @Roles(
    AdministratorRoleEnum.SUPER_ADMIN,
    AdministratorRoleEnum.ADMIN,
    AdministratorRoleEnum.MANAGER,
    AdministratorRoleEnum.USER,
  )
  async findMe(@Req() req: Request) {
    const user = req['user'] as Record<string, any>;
    const id = user?.id;
    const isExist = await this.administratorService.findUniqueWithPhoto({
      where: { id: +id },
      select: administratorSelectedFields,
    });

    return { data: isExist };
  }

  /**
   * API: Controller
   * Message: Get One - administrator
   */
  @Get(':id')
  @Roles(
    AdministratorRoleEnum.SUPER_ADMIN,
    AdministratorRoleEnum.ADMIN,
    AdministratorRoleEnum.MANAGER,
  )
  async findOne(@Param('id') id: string) {
    const isExist = await this.administratorService.findUniqueWithPhoto({
      where: { id: +id },
      select: administratorSelectedFields,
    });
    return { data: isExist };
  }

  /**
   * API: Controller
   * Message: Update Me - administrator
   */
  @Patch('update')
  @Roles(
    AdministratorRoleEnum.SUPER_ADMIN,
    AdministratorRoleEnum.ADMIN,
    AdministratorRoleEnum.MANAGER,
    AdministratorRoleEnum.USER,
  )
  async updateMe(
    @Body() updateAdministratorDto: UpdateAdministratorDto,
    @Req() req: Request,
  ) {
    const user = req['user'] as Record<string, any>;
    const id = user?.id;
    if (updateAdministratorDto.role) {
      throw new BadRequestException('You can not change your role');
    }
    const result = await this.administratorService.update(
      +id,
      updateAdministratorDto,
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = result;
    return { data: rest };
  }

  /**
   * API: Controller
   * Message: Update - administrator
   */
  @Patch(':id')
  @Roles(AdministratorRoleEnum.SUPER_ADMIN, AdministratorRoleEnum.ADMIN)
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
    const result = await this.administratorService.update(
      +id,
      updateAdministratorDto,
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = result;
    return { data: rest };
  }

  /**
   * API: Controller
   * Message: Delete - administrator
   */
  @Delete(':id')
  @Roles(AdministratorRoleEnum.SUPER_ADMIN, AdministratorRoleEnum.ADMIN)
  async remove(@Param('id') id: string) {
    const data = await this.administratorService.remove(+id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = data;
    return { data: rest };
  }
}
