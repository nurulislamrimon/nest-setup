import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { AdministratorRoleEnum } from 'src/constants/enum.constants';

export class CreateAdministratorDto {
  @IsString()
  full_name: string;

  @IsString()
  phone_number: string;

  @IsString()
  email: string;

  @IsEnum(AdministratorRoleEnum)
  @IsOptional()
  role: AdministratorRoleEnum;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  profile_photo?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsString()
  @IsOptional()
  address?: string;

  [key: string]: any;
}
