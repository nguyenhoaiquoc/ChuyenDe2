import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from 'src/entities/product.entity';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // 🧩 Tạo sản phẩm mới
  @Post()
  async create(@Body() body: Partial<Product>) {
    console.log('🔥 Body nhận từ frontend:', body);
    return await this.productService.create(body);
  }

  // 🧩 Lấy danh sách sản phẩm (có thể lọc theo category_id)
  @Get()
  async findAll(@Query('category_id') categoryId?: string) {
    console.log(
      'Đang gọi GET /products',
      categoryId ? `with category_id=${categoryId}` : '',
    );

    const userId = 1;
    // ⚡ Gọi hàm đã format dữ liệu (đã có subCategory, category, tag, v.v.)
    if (categoryId) {
      // Nếu có category_id → lọc theo danh mục cha
      const products = await this.productService.findByCategoryId(+categoryId);
      return await this.productService.formatProducts(products, userId); // Format riêng cho kết quả lọc
    }

    return await this.productService.getAllProducts(userId);
  }
}
