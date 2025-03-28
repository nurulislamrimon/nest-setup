import {
  Controller,
  Get,
  Param,
  UseInterceptors,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { SellerSessionService } from './seller-session.service';
import { Roles } from 'src/decorators/Roles.decorator';
import { SearchFilterAndPaginationInterceptor } from 'src/interceptors/searchFilterAndPagination.interceptor';
import {
  sellerSessionFilterableFields,
  sellerSessionSearchableFields,
  sellerSessionSelectedFields,
} from './seller-session.constants';
import { formatPagination } from 'src/utils/format.utils';

@Controller('sellers-session')
export class SellerSessionController {
  constructor(private readonly sellerSessionService: SellerSessionService) {}

  /**
   * API: Controller
   * Message: Get All - seller-session
   */
  @Get()
  @Roles('super_admin', 'admin')
  @UseInterceptors(
    new SearchFilterAndPaginationInterceptor<'Seller_session'>(
      sellerSessionSearchableFields,
      sellerSessionFilterableFields,
    ),
  )
  async findAll(@Req() req: Request) {
    const where = req['where'];
    const pagination = req['pagination'] as Record<string, string | number>;

    const result = await this.sellerSessionService.findAll({
      where,
      // select: sellerSessionSelectedFields,
      select: {
        ...sellerSessionSelectedFields,
        seller: { select: { email: true, id: true } },
      },
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

  /**
   * API: Controller
   * Message: Get One - seller-session
   */
  @Get(':id')
  @Roles('super_admin', 'admin')
  async findOne(@Param('id') id: string) {
    const data = await this.sellerSessionService.findUnique({
      where: { id: +id },
    });
    if (!data) {
      throw new NotFoundException('Data not found');
    }
    return data;
  }
}
