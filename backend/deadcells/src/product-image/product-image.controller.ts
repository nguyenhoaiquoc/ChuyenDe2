import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ProductImageService } from './product-image.service';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { BulkCreateProductImageDto } from './dto/bulk-create-product-image.dto';

@Controller('product-images')
export class ProductImageController {
    constructor(private readonly productImageService: ProductImageService) { }

    @Post()
    async create(@Body() dto: CreateProductImageDto) {
        return this.productImageService.create(dto);
    }

    @Get(':productId')
    async getByProduct(@Param('productId') productId: number) {
        return this.productImageService.findByProduct(productId);
    }

    @Post('bulk')
    async bulkCreate(@Body() dto: BulkCreateProductImageDto) {
        return this.productImageService.bulkCreate(dto.images);
    }

}
