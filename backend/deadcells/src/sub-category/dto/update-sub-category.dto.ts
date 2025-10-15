import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateSubCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  parent_category_id?: number;

  @IsOptional()
  @IsString()
  source_table?: string;

  @IsOptional()
  @IsNumber()
  source_id?: number;
}
