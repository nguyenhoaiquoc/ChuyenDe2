import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
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

  // 1. TẠO SẢN PHẨM
  @Post()
  @UseInterceptors(FilesInterceptor('files', 4, CloudinaryMulter))
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: Partial<Product>,
  ) {
    // Cloudinary trả về URL trong file.path
    const imageUrls = files.map((file) => file.path);

    // Bạn nên truyền imageUrls vào service, không phải 'files'
    return await this.productService.create(body, imageUrls); // <<< Sửa ở đây
  }

  // 2. LẤY SẢN PHẨM (TẤT CẢ, TÌM KIẾM, LỌC)
  @Get()
  async searchAndFilterProducts(
    // Đổi tên 'q' thành 'search' để thống nhất
    @Query('search') search?: string, 
    @Query('category_id') categoryId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('condition') condition?: string,
    @Query('sortBy') sortBy?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters = {
      q: search, // Gán 'search' vào 'q' để tương thích với service
      category_id: categoryId,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      condition,
      sortBy,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    };

    // Dùng một hàm service duy nhất
    return this.productService.searchAndFilter(filters);
  }
 
  // 3. LẤY CHI TIẾT SẢN PHẨM (Ví dụ)
  // Bạn có thể sẽ cần hàm này
  /*
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productService.findOneById(Number(id));
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }
    return product;
  }
  */
}