import { Controller, Get, Param } from '@nestjs/common';
import { ProductTypeService } from './product-type.service';

@Controller('product-types')
export class ProductTypeController {
  constructor(private readonly productTypeService: ProductTypeService) {}

  @Get()
  async getAll() {
    return this.productTypeService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    return this.productTypeService.findOne(id);
  }

  @Get('by-category/:categoryId')
  async getByCategory(@Param('categoryId') categoryId: number) {
    return this.productTypeService.findByCategory(categoryId);
  }

  @Get('by-sub-category/:subCategoryId')
  async getBySubCategory(@Param('subCategoryId') subCategoryId: number) {
    return this.productTypeService.findBySubCategory(subCategoryId);
  }
}
