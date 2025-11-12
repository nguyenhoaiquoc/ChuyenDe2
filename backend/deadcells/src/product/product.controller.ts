import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ParseIntPipe,
  Delete,
  Request,
  NotFoundException,
  Logger,
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
  private readonly logger = new Logger(ProductController.name);

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

 /**
   * (Người dùng) Cập nhật chi tiết tin đăng
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files', 4, CloudinaryMulter)) 
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() updateDto: Partial<CreateProductDto>,
    @UploadedFiles() files: Express.Multer.File[], 
  ) {
    const userId = req.user.id;
    // 👇 Truyền 'files' vào service
    return this.productService.updateProduct(id, userId, updateDto, files);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  hardDelete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.id;
    return this.productService.hardDeleteProduct(id, userId);
  }

  // 🟢 Lấy sản phẩm liên quan (ĐẶT TRƯỚC HÀM /:id)
  @Get(':id/related')
  async findRelated(@Param('id', ParseIntPipe) id: number) {
    // Lấy thông tin sản phẩm hiện tại để biết category
    const currentProduct = await this.productService.findById(id);
    if (!currentProduct) {
      throw new NotFoundException(`Không tìm thấy sản phẩm ID ${id}`);
    }

    // Kiểm tra xem có category và subCategory không
    if (!currentProduct.category?.id || !currentProduct.subCategory?.id) {
      this.logger.warn(
        `Sản phẩm ${id} thiếu category hoặc subCategory, không thể tìm bài liên quan.`,
      );
      return []; // Trả về mảng rỗng nếu thiếu thông tin
    }

    return this.productService.findRelatedProducts(
      id,
      currentProduct.category.id,
      currentProduct.subCategory.id,
      8, // Lấy tối đa 8 sản phẩm liên quan
    );
  }

  // === ẨN BÀI ĐĂNG ===
  @UseGuards(JwtAuthGuard)
  @Patch(':id/hide')
  async hideProduct(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.productService.hideProduct(id, req.user.id);
  }

  // === HIỆN LẠI BÀI ĐÃ ẨN ===
  @UseGuards(JwtAuthGuard)
  @Patch(':id/unhide')
  async unhideProduct(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.productService.unhideProduct(id, req.user.id);
  }

  // === YÊU CẦU GIA HẠN ===
  @UseGuards(JwtAuthGuard)
  @Post(':id/extension')
  async requestExtension(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body('reason') reason: string,
  ) {
    return this.productService.requestExtension(id, req.user.id, reason);
  }

  // === ADMIN DUYỆT GIA HẠN ===
  @UseGuards(JwtAuthGuard) // + AdminGuard
  @Patch(':id/approve-extension')
  async approveExtension(@Param('id', ParseIntPipe) id: number) {
    return this.productService.approveExtension(id);
  }

  // 🟢 Lấy chi tiết 1 bài
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findById(id);
  }
}
