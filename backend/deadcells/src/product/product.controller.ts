// src/product/product.controller.ts

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
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
}
