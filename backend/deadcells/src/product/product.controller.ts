// src/product/product.controller.ts

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryMulter } from 'src/cloudinary/cloudinary.config';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from 'src/auth/optional-jwt-auth.guard';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 4, CloudinaryMulter))
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createProductDto: CreateProductDto,
  ) {
    return await this.productService.create(createProductDto, files);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async findAll(@Req() req, @Query('category_id') category_id?: string) {
    const userId = req.user?.id || null;
    console.log('✅ userId:', userId);

    if (category_id) {
      return await this.productService.findByCategoryId(Number(category_id));
    }

    const result = await this.productService.findAllFormatted(userId);
    console.log('✅ products count:', result.length);
    return result;
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    // Gọi hàm "findById" mà ông nói đã có trong service
    return this.productService.findById(id); 
  }
   @Get('search')
  async searchProducts(
    @Query() query: any,
    @Req() req: Request,
  ): Promise<any> {
     // nếu có auth, lấy userId
    const filters = {
      q: query.q,
      category_id: query.category_id ? Number(query.category_id) : undefined,
      sub_category_id: query.sub_category_id ? Number(query.sub_category_id) : undefined,
      brand_id: query.brand_id ? Number(query.brand_id) : undefined,
      condition_id: query.condition_id ? Number(query.condition_id) : undefined,
      product_type_id: query.product_type_id ? Number(query.product_type_id) : undefined,
      deal_type_id: query.deal_type_id ? Number(query.deal_type_id) : undefined,
      post_type_id: query.post_type_id ? Number(query.post_type_id) : undefined,
      minPrice: query.minPrice ? Number(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
      sortBy: query.sortBy,
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 20,
    };

    return await this.productService.searchAndFilterFormatted(filters);
  }
  
}
