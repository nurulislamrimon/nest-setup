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
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { Request } from 'express';
import {
  sellerFilterableFields,
  sellerSearchableFields,
  sellerSelectedFields,
} from './seller.constants';
import { SellerService } from './seller.service';
import { Roles } from 'src/decorators/Roles.decorator';
import { Public } from 'src/decorators/public.decorator';
import { SearchFilterAndPaginationInterceptor } from 'src/interceptors/searchFilterAndPagination.interceptor';
import { formatPagination } from 'src/utils/format.utils';
import {
  ClientInfo,
  IClientInfo,
} from 'src/decorators/param/ClientInfo.decorator';
import { CloudflareService } from 'src/lib/cloudflare.service';
import { SellerSessionService } from '../seller-session/seller-session.service';
import { LoginSellerDto } from './dto/login-seller';

@Controller('sellers')
export class SellerController {
  constructor(
    private readonly sellerService: SellerService,
    private readonly sellerSessionService: SellerSessionService,
    private readonly cloudflareService: CloudflareService,
  ) {}

  /**
   * API: Controller
   * Message: Signup - seller
   */
  @Post('signup')
  async signUp(@Body() createSellerDto: CreateSellerDto) {
    const isExist = await this.sellerService.findUnique({
      where: { email: createSellerDto.email, is_active: true },
    });
    if (isExist) {
      throw new BadRequestException('Seller already exist');
    }
    createSellerDto.is_active = false;

    const data = await this.sellerService.create(createSellerDto);

    // delete existing not active sellers
    await this.sellerService.removeMany({
      where: { email: createSellerDto.email, is_active: false },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = data;

    return {
      message: 'Seller created successfully',
      data: rest,
    };
  }

  /**
   * API: Controller
   * Message: Create - seller
   */
  @Post('add')
  @Roles('super_admin', 'admin')
  async create(@Body() createSellerDto: CreateSellerDto) {
    const isExist = await this.sellerService.findUnique({
      where: { email: createSellerDto.email, is_active: true },
    });

    if (isExist) {
      throw new BadRequestException('Seller already exist');
    }
    createSellerDto.is_active = true;
    const data = await this.sellerService.create(createSellerDto);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = data;
    return {
      message: 'Seller created successfully',
      data: rest,
    };
  }

  /**
   * API: Controller
   * Message: Login - seller
   */
  @Post('login')
  @Public()
  async login(
    @Body() loginSellerDto: LoginSellerDto,
    @ClientInfo() clientInfo: IClientInfo,
  ) {
    const isExist = await this.sellerService.findUnique({
      where: { email: loginSellerDto.email },
    });

    if (!isExist) {
      throw new NotFoundException('Seller not found');
    }

    const isPasswordMatched = await this.sellerService.isPasswordMatched({
      inputPassword: loginSellerDto.password,
      currentPassword: isExist.password,
    });

    if (!isPasswordMatched) {
      throw new BadRequestException('Invalid credentials!');
    }

    const accessToken = this.sellerService.createToken({
      id: isExist.id,
      email: isExist.email,
      role: isExist.role,
    });

    const sellerSessionData = {
      seller_id: isExist.id,
      ...clientInfo,
    };

    const sellerSession =
      await this.sellerSessionService.create(sellerSessionData);

    if (!sellerSession) {
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
      message: 'Seller created successfully',
      data: {
        user: { ...rest, profile_photo_url },
        accessToken,
      },
    };
  }

  /**
   * API: Controller
   * Message: Get All - seller
   */
  @Get()
  @Roles('super_admin', 'admin', 'manager')
  @UseInterceptors(
    new SearchFilterAndPaginationInterceptor<'Seller'>(
      sellerSearchableFields,
      sellerFilterableFields,
    ),
  )
  async findAll(@Req() req: Request) {
    const where = req['where'];
    const pagination = req['pagination'] as Record<string, string | number>;
    const data = await this.sellerService.findAll({
      where,
      select: sellerSelectedFields,
      ...formatPagination(pagination),
    });

    return {
      message: 'Seller retrived successfully',
      meta: {
        total: data.total,
        limit: Number(pagination.limit),
        page: Number(pagination.page),
      },
      data: data.sellers,
    };
  }

  /**
   * API: Controller
   * Message: Get Me - seller
   */
  @Get('me')
  @Roles('regular', 'premium')
  async findMe(@Req() req: Request) {
    const user = req['user'] as Record<string, any>;
    const id = user?.id;
    const isExist = await this.sellerService.findUniqueWithPhoto({
      where: { id: +id },
      select: sellerSelectedFields,
    });

    return { data: isExist };
  }

  /**
   * API: Controller
   * Message: Get Unique - seller
   */
  @Get(':id')
  @Roles('super_admin', 'admin', 'manager')
  async findOne(@Param('id') id: string) {
    const isExist = await this.sellerService.findUniqueWithPhoto({
      where: { id: +id },
      select: sellerSelectedFields,
    });

    return { data: isExist };
  }

  /**
   * API: Controller
   * Message: Update Me - seller
   */
  @Patch('update')
  @Roles('regular', 'premium')
  async updateMe(
    @Body() updateSellerDto: UpdateSellerDto,
    @Req() req: Request,
  ) {
    const user = req['user'] as Record<string, any>;
    const id = user?.id;
    if (updateSellerDto.role) {
      throw new BadRequestException('You can not change your role');
    }
    const result = await this.sellerService.update(+id, updateSellerDto);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = result;
    return { data: rest };
  }

  /**
   * API: Controller
   * Message: Update - seller
   */
  @Patch(':id')
  @Roles('super_admin', 'admin')
  async updateById(
    @Param('id') id: string,
    @Body() updateSellerDto: UpdateSellerDto,
  ) {
    const isExist = await this.sellerService.findUnique({
      where: { id: +id },
    });

    if (!isExist) {
      throw new NotFoundException('Seller not found');
    }
    const result = await this.sellerService.update(+id, updateSellerDto);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = result;
    return { data: rest };
  }

  /**
   * API: Controller
   * Message: Delete - seller
   */
  @Delete(':id')
  @Roles('super_admin', 'admin')
  async remove(@Param('id') id: string) {
    const data = await this.sellerService.remove(+id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = data;
    return { data: rest };
  }
}
