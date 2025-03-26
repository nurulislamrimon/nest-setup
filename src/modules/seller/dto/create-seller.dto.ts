import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SellerRoleEnum } from 'src/constants/enum.constants';

export class CreateSellerDto {
  @IsString()
  full_name: string;

  @IsString()
  phone_number: string;

  @IsString()
  email: string;

  @IsEnum(SellerRoleEnum)
  role: SellerRoleEnum;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  profilePhoto?: string;

  @IsString()
  @IsOptional()
  address?: string;

  [key: string]: any;
}
