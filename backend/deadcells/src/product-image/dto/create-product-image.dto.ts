import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateProductImageDto {
  @IsNotEmpty()
  @IsNumber()
  product_id: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  image_url: string;
}
