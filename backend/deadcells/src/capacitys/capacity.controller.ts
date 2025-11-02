import { Controller, Get, Param } from '@nestjs/common';
import { CapacityService } from './capacity.service'; 

@Controller('capacities') 
export class CapacityController { 
  constructor(private readonly capacityService: CapacityService) {} 

  @Get()
  async getAll() {
    return this.capacityService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    return this.capacityService.findOne(id);
  }

  @Get('by-category/:categoryId')
  async getByCategory(@Param('categoryId') categoryId: number) {
    return this.capacityService.findByCategory(categoryId);
  }

  @Get('by-sub-category/:subCategoryId')
  async getBySubCategory(@Param('subCategoryId') subCategoryId: number) {
    return this.capacityService.findBySubCategory(subCategoryId);
  }
}