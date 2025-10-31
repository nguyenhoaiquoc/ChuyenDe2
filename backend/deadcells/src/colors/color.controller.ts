import { Controller, Get, Param } from '@nestjs/common';
import { ColorService } from './color.service'; 

@Controller('colors') 
export class ColorController { 
  constructor(private readonly colorService: ColorService) {} 

  @Get()
  async getAll() {
    return this.colorService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    return this.colorService.findOne(id);
  }

  @Get('by-category/:categoryId')
  async getByCategory(@Param('categoryId') categoryId: number) {
    return this.colorService.findByCategory(categoryId);
  }

  @Get('by-sub-category/:subCategoryId')
  async getBySubCategory(@Param('subCategoryId') subCategoryId: number) {
    return this.colorService.findBySubCategory(subCategoryId);
  }
}