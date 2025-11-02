import { Controller, Get, Param } from '@nestjs/common';
import { BrandService } from './brand.service'; 

@Controller('brands') 
export class BrandController { 
  constructor(private readonly brandService: BrandService) {} 

  @Get()
  async getAll() {
    return this.brandService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    return this.brandService.findOne(id);
  }

  @Get('by-category/:categoryId')
  async getByCategory(@Param('categoryId') categoryId: number) {
    return this.brandService.findByCategory(categoryId);
  }

  @Get('by-sub-category/:subCategoryId')
  async getBySubCategory(@Param('subCategoryId') subCategoryId: number) {
    return this.brandService.findBySubCategory(subCategoryId);
  }
}