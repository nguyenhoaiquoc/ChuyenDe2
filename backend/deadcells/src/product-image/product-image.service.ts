import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { ProductImage } from 'src/entities/product-image.entity';

@Injectable()
export class ProductImageService {
    constructor(
        @InjectRepository(ProductImage)
        private readonly productImageRepo: Repository<ProductImage>,
    ) { }

    async create(dto: CreateProductImageDto): Promise<ProductImage> {
        const image = this.productImageRepo.create(dto);
        return this.productImageRepo.save(image);
    }

    async findByProduct(productId: number): Promise<ProductImage[]> {
        return this.productImageRepo.find({
            where: { product_id: productId },
            order: { created_at: 'ASC' },
        });
    }

    async bulkCreate(images: CreateProductImageDto[]): Promise<ProductImage[]> {
        const entities = this.productImageRepo.create(images);
        return this.productImageRepo.save(entities);
    }

}
