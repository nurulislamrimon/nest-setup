import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateParcelStatisticsDto {
  @IsString()
  phone_number: string;

  @IsNumber()
  @IsOptional()
  request_no: number;

  @IsNumber()
  seller_id: number;
}
