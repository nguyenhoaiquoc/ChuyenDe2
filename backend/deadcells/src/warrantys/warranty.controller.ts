import { Controller, Get, Param } from '@nestjs/common';
import { WarrantyService } from './warranty.service';

@Controller('warranties')
export class WarrantyController {
  constructor(private readonly warrantyService: WarrantyService) {}

  @Get()
  async getAll() {
    return this.warrantyService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    return this.warrantyService.findOne(id);
  }

  @Get('by-category/:categoryId')
  async getByCategory(@Param('categoryId') categoryId: number) {
    return this.warrantyService.findByCategory(categoryId);
  }

  @Get('by-sub-category/:subCategoryId')
  async getBySubCategory(@Param('subCategoryId') subCategoryId: number) {
    return this.warrantyService.findBySubCategory(subCategoryId);
  }
}