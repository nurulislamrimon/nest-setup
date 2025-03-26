import { PartialType } from '@nestjs/mapped-types';
import { CreateSellerSessionDto } from './create-seller-session.dto';

export class UpdateSellerSessionDto extends PartialType(
  CreateSellerSessionDto,
) {}
