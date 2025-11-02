import { Controller, Get, Param } from '@nestjs/common';
import { GenderService } from './gender.service';

@Controller('genders')
export class GenderController {
  constructor(private readonly genderService: GenderService) {}

  @Get()
  async getAll() {
    return this.genderService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    return this.genderService.findOne(id);
  }

  @Get('by-category/:categoryId')
  async getByCategory(@Param('categoryId') categoryId: number) {
    return this.genderService.findByCategory(categoryId);
  }

  @Get('by-sub-category/:subCategoryId')
  async getBySubCategory(@Param('subCategoryId') subCategoryId: number) {
    return this.genderService.findBySubCategory(subCategoryId);
  }
}