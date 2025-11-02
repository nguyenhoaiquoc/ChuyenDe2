import { Controller, Get, Param } from '@nestjs/common';
import { BreedService } from './breed.service';

@Controller('breeds')
export class BreedController {
  constructor(private readonly breedService: BreedService) {}

  @Get()
  async getAll() {
    return this.breedService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    return this.breedService.findOne(id);
  }

  @Get('by-category/:categoryId')
  async getByCategory(@Param('categoryId') categoryId: number) {
    return this.breedService.findByCategory(categoryId);
  }

  @Get('by-sub-category/:subCategoryId')
  async getBySubCategory(@Param('subCategoryId') subCategoryId: number) {
    return this.breedService.findBySubCategory(subCategoryId);
  }
}