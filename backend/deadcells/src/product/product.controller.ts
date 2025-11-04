import {
  Controller, Get, Post, Patch, Param, Body, Query, Req,
  UploadedFiles, UseGuards, UseInterceptors, ParseIntPipe,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryMulter } from 'src/cloudinary/cloudinary.config';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from 'src/auth/optional-jwt-auth.guard';
import { UpdateProductStatusDto } from './dto/update-status.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // 🟢 Tạo bài đăng (đăng sản phẩm mới)
  @Post()
  @UseInterceptors(FilesInterceptor('files', 4, CloudinaryMulter))
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createProductDto: CreateProductDto,
  ) {
    return await this.productService.create(createProductDto, files);
  }

  // 🟢 Lấy danh sách bài hiển thị ngoài trang chủ
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async findAll(@Req() req, @Query('category_id') category_id?: string) {
    const userId = req.user?.id || null;
    if (category_id) {
      return await this.productService.findByCategoryId(Number(category_id));
    }
    return await this.productService.findAllFormatted(userId);
  }

  // 🟢 Người dùng xem tất cả bài đăng của chính mình
  @Get('my-posts/:userId')
  async getMyPosts(@Param('userId', ParseIntPipe) userId: number) {
    return this.productService.findByUserId(userId);
  }

  // 🟣 Admin xem tất cả bài (bỏ lọc duyệt)
  @Get('admin/all')
  async findAllForAdmin() {
    return this.productService.findAllForAdmin();
  }

  // 🟣 Admin duyệt / từ chối bài
  @Patch('admin/status/:id')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductStatusDto,
  ) {
    return this.productService.updateProductStatus(id, dto);
  }

  // 🔍 Tìm kiếm sản phẩm (hỗ trợ name, price, category, sort, phân trang)
  @Get('search')
  async searchProducts(
    @Query('name') name?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('category') category?: string,
    @Query('sort') sort?: 'asc' | 'desc',
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.productService.searchProducts({
      name,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      category,
      sort,
      page: Number(page),
      limit: Number(limit),
    });
  }

  // 🟢 Lấy chi tiết 1 bài
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findById(id);
  }
}
