import { PartialType } from '@nestjs/mapped-types';
import { CreateAdministratorSessionDto } from './create-administrator-session.dto';

export class UpdateAdministratorSessionDto extends PartialType(
  CreateAdministratorSessionDto,
) {}
