import { Controller, Get, Param } from '@nestjs/common';
import { GraphicsCardService } from './graphics-card.service';

@Controller('graphics-cards')
export class GraphicsCardController {
  constructor(private readonly graphicsCardService: GraphicsCardService) {}

  @Get()
  async getAll() {
    return this.graphicsCardService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    return this.graphicsCardService.findOne(id);
  }

  @Get('by-category/:categoryId')
  async getByCategory(@Param('categoryId') categoryId: number) {
    return this.graphicsCardService.findByCategory(categoryId);
  }

  @Get('by-sub-category/:subCategoryId')
  async getBySubCategory(@Param('subCategoryId') subCategoryId: number) {
    return this.graphicsCardService.findBySubCategory(subCategoryId);
  }
}