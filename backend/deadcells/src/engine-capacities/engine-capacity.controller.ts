import { Controller, Get, Param } from '@nestjs/common';
import { EngineCapacityService } from './engine-capacity.service';

@Controller('engine-capacities')
export class EngineCapacityController {
  constructor(private readonly service: EngineCapacityService) {}

  @Get()
  async getAll() {
    return this.service.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Get('by-category/:categoryId')
  async getByCategory(@Param('categoryId') categoryId: number) {
    return this.service.findByCategory(categoryId);
  }

  @Get('by-sub-category/:subCategoryId')
  async getBySubCategory(@Param('subCategoryId') subCategoryId: number) {
    return this.service.findBySubCategory(subCategoryId);
  }
}