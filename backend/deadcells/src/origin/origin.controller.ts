import { Controller, Get, Param } from '@nestjs/common';
import { OriginService } from './origin.service';

@Controller('origins')
export class OriginController {
  constructor(private readonly originService: OriginService) {}

  @Get()
  async getAll() {
    return this.originService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    return this.originService.findOne(id);
  }

  @Get('by-category/:categoryId')
  async getByCategory(@Param('categoryId') categoryId: number) {
    return this.originService.findByCategory(categoryId);
  }

  @Get('by-sub-category/:subCategoryId')
  async getBySubCategory(@Param('subCategoryId') subCategoryId: number) {
    return this.originService.findBySubCategory(subCategoryId);
  }
}
