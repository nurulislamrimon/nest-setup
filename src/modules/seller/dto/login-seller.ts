import { IsString } from 'class-validator';

export class LoginSellerDto {
  @IsString()
  email: string;

  @IsString()
  password: string;
}

export class SellerPasswordDto {
  inputPassword: string;
  currentPassword: string;
}
