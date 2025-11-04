import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateSubCategoryDto {
  @IsString()
  name: string;

  @IsNumber()
  parent_category_id: number;

  @IsString()
  source_table: string;

  @IsOptional()
  @IsNumber()
  source_id?: number;
}
