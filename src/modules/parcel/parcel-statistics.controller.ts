import {
  Controller,
  Get,
  Param,
  Delete,
  UseInterceptors,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { ParcelStatisticsService } from './parcel-statistics.service';
import { Roles } from 'src/decorators/Roles.decorator';
import { SearchFilterAndPaginationInterceptor } from 'src/interceptors/searchFilterAndPagination.interceptor';
import {
  parcelStatisticsFilterableFields,
  parcelStatisticsSearchableFields,
} from './parcel-statistics.constants';
import { formatPagination } from 'src/utils/format.utils';
import {
  AdministratorRoleEnum,
  SellerRoleEnum,
} from 'src/constants/enum.constants';
import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

@Controller('parcel-statistics')
export class ParcelStatisticsController {
  constructor(private readonly parcelService: ParcelStatisticsService) {}

  @Get()
  @Roles(AdministratorRoleEnum.SUPER_ADMIN, AdministratorRoleEnum.ADMIN)
  @UseInterceptors(
    new SearchFilterAndPaginationInterceptor<'Parcel_statistics'>(
      parcelStatisticsSearchableFields,
      parcelStatisticsFilterableFields,
    ),
  )
  async findAll(@Req() req: Request) {
    const where = req['where'];
    const pagination = req['pagination'] as Record<string, string | number>;

    const result = await this.parcelService.findAll({
      where,
      ...formatPagination(pagination),
    });
    return {
      meta: {
        total: result.total,
        page: Number(pagination.page),
        limit: Number(pagination.limit),
      },
      data: result.data,
    };
  }

  @Get(':phone')
  async getStatisticsFromServer(
    @Req() req: Request,
    @Param('phone') phone: string,
  ) {
    const user = req.user as JwtPayload;

    const result = await this.parcelService.getStatisticsFromServer(phone);
    // update user history
    if (user.role === SellerRoleEnum.SELLER) {
      await this.parcelService.upsert({
        phone_number: result.phoneNumber,
        seller_id: user.id,
      });
    }
    return result;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const isExist = await this.parcelService.findUnique({ where: { id: +id } });
    if (!isExist) {
      throw new NotFoundException('Parcel statistics not found!');
    }
    return await this.parcelService.remove({ where: { id: +id } });
  }
}
