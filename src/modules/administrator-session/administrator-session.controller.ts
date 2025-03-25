import {
  Controller,
  Get,
  Param,
  UseInterceptors,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { AdministratorSessionService } from './administrator-session.service';
import { Roles } from 'src/decorators/Roles.decorator';
import { SearchFilterAndPaginationInterceptor } from 'src/interceptors/searchFilterAndPagination.interceptor';
import {
  administratorSessionFilterableFields,
  administratorSessionSearchableFields,
  administratorSessionSelectedFields,
} from './administrator-session.constants';
import { formatPagination } from 'src/utils/format.utils';

@Controller('administrators-session')
export class AdministratorSessionController {
  constructor(
    private readonly administratorSessionService: AdministratorSessionService,
  ) {}

  @Get()
  @Roles('super_admin', 'admin')
  @UseInterceptors(
    new SearchFilterAndPaginationInterceptor<'Administrator_session'>(
      administratorSessionSearchableFields,
      administratorSessionFilterableFields,
    ),
  )
  async findAll(@Req() req: Request) {
    const where = req['where'];
    const pagination = req['pagination'] as Record<string, string | number>;

    const result = await this.administratorSessionService.findAll({
      where,
      // select: administratorSessionSelectedFields,
      select: {
        ...administratorSessionSelectedFields,
        administrator: { select: { email: true, id: true } },
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

  @Get(':id')
  @Roles('super_admin', 'admin')
  async findOne(@Param('id') id: string) {
    const data = await this.administratorSessionService.findUnique({
      where: { id: +id },
    });
    if (!data) {
      throw new NotFoundException('Data not found');
    }
    return data;
  }
}
