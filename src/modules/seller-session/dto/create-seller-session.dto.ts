import { IsString } from 'class-validator';

export class CreateSellerSessionDto {
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

  seller_id: number;
}
