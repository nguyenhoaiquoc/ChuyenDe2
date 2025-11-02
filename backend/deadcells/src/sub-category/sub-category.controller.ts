import { Controller, Get, Param, Post, Body, Put, Delete } from '@nestjs/common';
import { SubCategoryService } from './sub-category.service';

@Controller('sub-categories')
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) { }

  @Get()
  findAll() {
    return this.subCategoryService.findAll();
  }

  @Get('academic_categories')
  getAcademicCategories() {
    return this.subCategoryService.findByCategory(1);
  }

  @Get('fashion_categories')
  getFashionCategories() {
    return this.subCategoryService.findByCategory(2);
  }

  @Get('house_categories')
  getHouseCategories() {
    return this.subCategoryService.findByCategory(3);
  }

  @Get('electronic_categories')
  getElectronicCategories() {
    return this.subCategoryService.findByCategory(4);
  }

  @Get('animal_categories')
  getAnimalCategories() {
    return this.subCategoryService.findByCategory(5);
  }

  @Get('vehicle_categories')
  getVehicleCategories() {
    return this.subCategoryService.findByCategory(6);
  }

  @Get('game_categories')
  getGameCategories() {
    return this.subCategoryService.findByCategory(7);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subCategoryService.findOne(+id);
  }

  @Post()
  create(@Body() body: any) {
    return this.subCategoryService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.subCategoryService.update(+id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subCategoryService.remove(+id);
  }


}
