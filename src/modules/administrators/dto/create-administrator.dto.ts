import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RoleEnum } from 'src/constants/enums';

export class CreateAdministratorDto {
  @IsString()
  full_name: string;

  @IsString()
  phone_number: string;

  @IsString()
  email: string;

  @IsString()
  @IsEnum(RoleEnum)
  role: string;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  address: string;

  failed_attemp_ip: string[];
}
