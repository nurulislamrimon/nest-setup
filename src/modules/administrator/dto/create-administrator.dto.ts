import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RoleEnum } from 'src/constants/enum.constants';

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
  address?: string;

  [key: string]: any;
}

export class CreateAdministratorSessionDto {
  @IsString()
  token: string;

  @IsString()
  ip: string;

  @IsString()
  user_agent: string;

  @IsString()
  device: string;

  @IsString()
  platform: string;

  @IsString()
  browser: string;

  administrator_id: number;
}
