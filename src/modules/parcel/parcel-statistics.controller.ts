import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { ParcelStatisticsService } from './parcel-statistics.service';
import { UpdateParcelStatisticsDto } from './dto/update-parcel-statistics.dto';
import { Roles } from 'src/decorators/Roles.decorator';
import { SearchFilterAndPaginationInterceptor } from 'src/interceptors/searchFilterAndPagination.interceptor';
import {
  parcelStatisticsFilterableFields,
  parcelStatisticsSearchableFields,
} from './parcel-statistics.constants';
import { formatPagination } from 'src/utils/format.utils';
import { AdministratorRoleEnum } from 'src/constants/enum.constants';

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
  getStatisticsFromServer(@Param('phone') phone: string) {
    return this.parcelService.getStatisticsFromServer(phone);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.parcelService.findOne({ where: { id: +id } });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateParcelDto: UpdateParcelStatisticsDto,
  ) {
    return this.parcelService.update({
      where: { id: +id },
      data: updateParcelDto,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.parcelService.remove({ where: { id: +id } });
  }
}
