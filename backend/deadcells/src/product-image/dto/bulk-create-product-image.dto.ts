import { Type } from 'class-transformer';
import { ValidateNested, IsArray } from 'class-validator';
import { CreateProductImageDto } from './create-product-image.dto';

export class BulkCreateProductImageDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images: CreateProductImageDto[];
}
