import { Controller, Get, Param } from '@nestjs/common';
import { RamOptionService } from './ram-option.service';

@Controller('ram-options')
export class RamOptionController {
  constructor(private readonly ramOptionService: RamOptionService) {}

  @Get()
  async getAll() {
    return this.ramOptionService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    return this.ramOptionService.findOne(id);
  }

  @Get('by-category/:categoryId')
  async getByCategory(@Param('categoryId') categoryId: number) {
    return this.ramOptionService.findByCategory(categoryId);
  }

  @Get('by-sub-category/:subCategoryId')
  async getBySubCategory(@Param('subCategoryId') subCategoryId: number) {
    return this.ramOptionService.findBySubCategory(subCategoryId);
  }
}