import { IsString } from 'class-validator';

export class CreateAdministratorSessionDto {
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
