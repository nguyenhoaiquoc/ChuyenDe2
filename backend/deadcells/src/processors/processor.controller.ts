import { Controller, Get, Param } from '@nestjs/common';
import { ProcessorService } from './processor.service';

@Controller('processors')
export class ProcessorController {
  constructor(private readonly processorService: ProcessorService) {}

  @Get()
  async getAll() {
    return this.processorService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    return this.processorService.findOne(id);
  }

  @Get('by-category/:categoryId')
  async getByCategory(@Param('categoryId') categoryId: number) {
    return this.processorService.findByCategory(categoryId);
  }

  @Get('by-sub-category/:subCategoryId')
  async getBySubCategory(@Param('subCategoryId') subCategoryId: number) {
    return this.processorService.findBySubCategory(subCategoryId);
  }
}