import { Controller, Get, Param } from '@nestjs/common';
import { AgeRangeService } from './age-range.service';

@Controller('age-ranges')
export class AgeRangeController {
  constructor(private readonly ageRangeService: AgeRangeService) {}

  @Get()
  async getAll() {
    return this.ageRangeService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    return this.ageRangeService.findOne(id);
  }

  @Get('by-category/:categoryId')
  async getByCategory(@Param('categoryId') categoryId: number) {
    return this.ageRangeService.findByCategory(categoryId);
  }

  @Get('by-sub-category/:subCategoryId')
  async getBySubCategory(@Param('subCategoryId') subCategoryId: number) {
    return this.ageRangeService.findBySubCategory(subCategoryId);
  }
}