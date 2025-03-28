import { PartialType } from '@nestjs/mapped-types';
import { CreateParcelStatisticsDto } from './create-parcel-statistics.dto';

export class UpdateParcelStatisticsDto extends PartialType(
  CreateParcelStatisticsDto,
) {}
