import { IsString } from 'class-validator';

export class LoginAdministratorDto {
  @IsString()
  email: string;

  @IsString()
  password: string;
}

export class PasswordDto {
  inputPassword: string;
  currentPassword: string;
}
