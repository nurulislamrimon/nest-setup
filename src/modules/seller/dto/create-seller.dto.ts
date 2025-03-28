import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { SellerRoleEnum } from 'src/constants/enum.constants';

export class CreateSellerDto {
  @IsString()
  full_name: string;

  @IsString()
  phone_number: string;

  @IsString()
  email: string;

  @IsEnum(SellerRoleEnum)
  @IsOptional()
  role: SellerRoleEnum;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  profile_photo?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsBoolean()
  @IsOptional()
  is_verified?: boolean;

  @IsString()
  @IsOptional()
  address?: string;

  [key: string]: any;
}
