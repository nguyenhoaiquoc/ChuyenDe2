import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from 'src/entities/category.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { uploadCategoryImage } from 'src/cloudinary/cloudinary-category';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getAllCategories() {
    console.log('Đang gọi GET /categories');
    return this.categoryService.findAll();
  }

  @Post()
  async createCategory(@Body() data: Partial<Category>): Promise<Category> {
    return this.categoryService.create(data);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image', { storage: uploadCategoryImage }))
  async updateCategory(
    @Param('id') id: string,
    @Body() body: { name?: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const updateData: Partial<Category> = {};

    if (body.name) updateData.name = body.name;
    if (file) {
      updateData.image = file.path; // Cloudinary trả về URL đầy đủ
    }

    return this.categoryService.update(+id, updateData);
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

  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    const result = await this.categoryService.remove(+id);
    return { message: 'Xóa danh mục thành công', data: result };
  }
}
