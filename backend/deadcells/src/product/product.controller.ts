import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from 'src/entities/product.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryMulter } from 'src/cloudinary/cloudinary.config';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // Upload ảnh lên Cloudinary và tạo sản phẩm
  @Post()
  @UseInterceptors(FilesInterceptor('files', 4, CloudinaryMulter))
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: Partial<Product>,
  ) {
    // console.log("🔥 Body nhận từ frontend:", body);
    // console.log("📸 Files nhận:", files?.length || 0);

    // Cloudinary trả về URL trong file.path
    const imageUrls = files.map((file) => file.path);

    return await this.productService.create(body, files);
  }

  @Get()
  async findAll(@Query('category_id') category_id?: string) {
    if (category_id) {
      const products = await this.productService.findByCategoryId(+category_id);
      return await this.productService.formatProducts(products);
    }
    return await this.productService.findAllFormatted();
  }
}
