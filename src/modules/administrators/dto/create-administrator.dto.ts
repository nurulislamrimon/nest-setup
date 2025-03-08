import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RoleEnum } from 'src/constants/enums';

export class CreateAdministratorDto {
  @IsString()
  full_name: string;

  @IsString()
  phone_number: string;

  @IsString()
  email: string;

  @IsEnum(RoleEnum)
  role: RoleEnum;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  address?: string; // Make it optional
}
