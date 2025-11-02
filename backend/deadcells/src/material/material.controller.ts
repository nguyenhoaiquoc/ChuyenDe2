import { Controller, Get, Param } from '@nestjs/common';
import { MaterialService } from './material.service'; 

@Controller('materials') 
export class MaterialController { 
  constructor(private readonly materialService: MaterialService) {}

  @Get()
  async getAll() {
    return this.materialService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    return this.materialService.findOne(id);
  }

  @Get('by-category/:categoryId')
  async getByCategory(@Param('categoryId') categoryId: number) {
    return this.materialService.findByCategory(categoryId);
  }

  @Get('by-sub-category/:subCategoryId')
  async getBySubCategory(@Param('subCategoryId') subCategoryId: number) {
    return this.materialService.findBySubCategory(subCategoryId);
  }
}