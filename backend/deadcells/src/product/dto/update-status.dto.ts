import { IsBoolean, IsNumber } from 'class-validator';

export class UpdateProductStatusDto {
  @IsNumber()
  product_status_id: number;
}