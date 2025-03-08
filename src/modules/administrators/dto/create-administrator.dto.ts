import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RoleEnum } from 'src/constants/enums'; // Make sure this is the correct import for the enum

export class CreateAdministratorDto {
  @IsString()
  full_name: string;

  @IsString()
  phone_number: string;

  @IsString()
  email: string;

  @IsEnum(RoleEnum) // Use the Prisma enum here
  role: RoleEnum; // This should be the actual enum type, not a string

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  address?: string; // Make it optional
}
