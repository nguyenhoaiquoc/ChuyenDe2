import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from 'src/entities/category.entity';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getAllCategories() {
    console.log("Đang gọi GET /categories");
    return this.categoryService.findAll();
  }

  @Post()
  async createCategory(@Body() data: Partial<Category>): Promise<Category> {
    return this.categoryService.create(data);
  }
  

  @Get('search')
  async search(@Query('name') name: string): Promise<Category[]> {
    console.log('Đang tìm danh mục theo tên:', name);
    return await this.categoryService.searchByName(name);
  }

  @Get('with-children')
  async getCategoriesWithChildren() {
    console.log('Đang gọi GET /categories/with-children');
    return await this.categoryService.findAllWithChildren();
  }

  
}
