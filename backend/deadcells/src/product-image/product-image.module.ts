import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductImageService } from './product-image.service';
import { ProductImageController } from './product-image.controller';
import { ProductImage } from 'src/entities/product-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductImage])],
  providers: [ProductImageService],
  controllers: [ProductImageController],
  exports: [ProductImageService],
})
export class ProductImageModule {}
