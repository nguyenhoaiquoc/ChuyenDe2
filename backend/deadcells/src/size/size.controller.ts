import { Controller, Get, Param } from '@nestjs/common';
import { SizeService } from './size.service'; 

@Controller('sizes') 
export class SizeController { 
  constructor(private readonly sizeService: SizeService) {} 

  @Get()
  async getAll() {
    return this.sizeService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    return this.sizeService.findOne(id);
  }

  @Get('by-category/:categoryId')
  async getByCategory(@Param('categoryId') categoryId: number) {
    return this.sizeService.findByCategory(categoryId);
  }

  @Get('by-sub-category/:subCategoryId')
  async getBySubCategory(@Param('subCategoryId') subCategoryId: number) {
    return this.sizeService.findBySubCategory(subCategoryId);
  }
}