import { IsBoolean, IsNumber } from 'class-validator';

export class UpdateProductStatusDto {
  @IsBoolean()
  is_approved: boolean;

  @IsNumber()
  product_status_id: number;
}