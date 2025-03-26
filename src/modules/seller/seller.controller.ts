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
import { ApiResponse } from 'src/interceptors/response.interceptor';
import { Seller } from '@prisma/client';
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

  @Post('add')
  @Roles('super_admin', 'admin')
  async create(@Body() createSellerDto: CreateSellerDto) {
    const isExist = await this.sellerService.findUnique({
      where: { email: createSellerDto.email },
    });
    if (isExist) {
      throw new BadRequestException('Seller already exist');
    }
    let uploadUrl: string | undefined;
    if (createSellerDto.profilePhoto) {
      const result = await this.cloudflareService.getUploadUrl(
        createSellerDto.profilePhoto,
      );
      createSellerDto.profilePhoto = result.fileName;
      uploadUrl = result.uploadUrl;
    }
    const data = await this.sellerService.create(createSellerDto);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = data;
    return {
      message: 'Seller created successfully',
      data: { ...rest, uploadUrl },
    };
  }

  @Post('login')
  @Public()
  async login(
    @Body() loginSellerDto: LoginSellerDto,
    @ClientInfo() clientInfo: IClientInfo,
  ): Promise<
    ApiResponse<{
      user: Omit<Seller, 'password'> & {
        profilePhotoUrl: string | undefined;
      };

      accessToken: string;
    }>
  > {
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
    let profilePhotoUrl: string | undefined;
    if (isExist.profilePhoto) {
      profilePhotoUrl = await this.cloudflareService.getDownloadUrl(
        isExist.profilePhoto as string,
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = isExist;
    return {
      message: 'Seller created successfully',
      data: {
        user: { ...rest, profilePhotoUrl },
        accessToken,
      },
    };
  }

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

    // add presigned url for profile photos
    const sellers = await Promise.all(
      data.sellers.map(async (ad) => {
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
      message: 'Seller retrived successfully',
      meta: {
        total: data.total,
        limit: Number(pagination.limit),
        page: Number(pagination.page),
      },
      data: sellers,
    };
  }

  @Get('me')
  async findMe(@Req() req: Request) {
    const user = req['user'] as Record<string, any>;
    const id = user?.id;
    const isExist = await this.sellerService.findUnique({
      where: { id: +id },
      select: sellerSelectedFields,
    });

    if (!isExist) {
      throw new NotFoundException("Seller doen't exist!");
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
    const isExist = await this.sellerService.findUnique({
      where: { id: +id },
      select: sellerSelectedFields,
    });
    if (!isExist) {
      throw new NotFoundException('Seller not found');
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
    @Body() updateSellerDto: UpdateSellerDto,
    @Req() req: Request,
  ) {
    const user = req['user'] as Record<string, any>;
    const id = user?.id;
    if (updateSellerDto.role) {
      throw new BadRequestException('You can not change your role');
    }
    const isExist = await this.sellerService.findUnique({
      where: { id: +id },
    });
    if (!isExist) {
      throw new NotFoundException('Seller not found');
    }
    let uploadUrl: string | undefined;
    if (updateSellerDto.profilePhoto) {
      // delete existing
      await this.cloudflareService.deleteFile(isExist.profilePhoto as string);
      // add new
      const result = await this.cloudflareService.getUploadUrl(
        updateSellerDto.profilePhoto,
      );
      updateSellerDto.profilePhoto = result.fileName;
      uploadUrl = result.uploadUrl;
    }
    const result = await this.sellerService.update(+id, updateSellerDto);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = result;
    return { data: { ...rest, uploadUrl } };
  }

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
    let uploadUrl: string | undefined;
    if (updateSellerDto.profilePhoto) {
      // delete existing
      await this.cloudflareService.deleteFile(isExist.profilePhoto as string);
      // add new
      const result = await this.cloudflareService.getUploadUrl(
        updateSellerDto.profilePhoto,
      );
      updateSellerDto.profilePhoto = result.fileName;
      uploadUrl = result.uploadUrl;
    }
    const result = await this.sellerService.update(+id, updateSellerDto);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = result;
    return { data: { ...rest, uploadUrl } };
  }

  @Delete(':id')
  @Roles('super_admin', 'admin')
  async remove(@Param('id') id: string) {
    const isExist = await this.sellerService.findUnique({
      where: { id: +id },
    });
    if (!isExist) throw new NotFoundException('Seller not found');

    if (isExist.profilePhoto) {
      await this.cloudflareService.deleteFile(isExist.profilePhoto as string);
    }

    const data = await this.sellerService.remove(+id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = data;
    return { data: rest };
  }
}
