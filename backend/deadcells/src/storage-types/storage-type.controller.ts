import { Controller, Get, Param } from '@nestjs/common';
import { StorageTypeService } from './storage-type.service';

@Controller('storage-types')
export class StorageTypeController {
  constructor(private readonly storageTypeService: StorageTypeService) {}

  @Get()
  async getAll() {
    return this.storageTypeService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    return this.storageTypeService.findOne(id);
  }

  @Get('by-category/:categoryId')
  async getByCategory(@Param('categoryId') categoryId: number) {
    return this.storageTypeService.findByCategory(categoryId);
  }

  @Get('by-sub-category/:subCategoryId')
  async getBySubCategory(@Param('subCategoryId') subCategoryId: number) {
    return this.storageTypeService.findBySubCategory(subCategoryId);
  }
}