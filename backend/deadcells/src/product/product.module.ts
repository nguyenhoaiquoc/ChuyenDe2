import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { ProductImage } from 'src/entities/product-image.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { DealType } from 'src/entities/deal-type.entity';
import { Condition } from 'src/entities/condition.entity';
import { SubCategory } from 'src/entities/sub-category.entity';
import { Category } from 'src/entities/category.entity';
import { FashionCategory } from 'src/entities/categories/fashion-category.entity';
import { GameCategory } from 'src/entities/categories/game-category.entity';
import { AcademicCategory } from 'src/entities/categories/academic-category.entity';
import { AnimalCategory } from 'src/entities/categories/animal-category.entity';
import { ElectronicCategory } from 'src/entities/categories/electronic-category.entity';
import { HouseCategory } from 'src/entities/categories/house-category.entity';
import { VehicleCategory } from 'src/entities/categories/vehicle-category.entity';
import { PostType } from 'src/entities/post-type.entity';
import { User } from 'src/entities/user.entity';
import { ProductType } from 'src/entities/product_types.entity';
import { GroupModule } from 'src/groups/group.module';
import { NotificationModule } from 'src/notification/notification.module';
import { Origin } from 'src/entities/origin.entity';
import { Material } from 'src/entities/material.entity';
import { Size } from 'src/entities/size.entity';
import { Brand } from 'src/entities/brand.entity';
import { Color } from 'src/entities/color.entity';
import { Warranty } from 'src/entities/warranty.entity';
import { Capacity } from 'src/entities/capacity.entity';
import { ProductModel } from 'src/entities/product-model.entity';
import { Processor } from 'src/entities/processor.entity';
import { RamOption } from 'src/entities/ram-option.entity';
import { StorageType } from 'src/entities/storage-type.entity';
import { GraphicsCard } from 'src/entities/graphics-card.entity';
import { Breed } from 'src/entities/breed.entity';
import { AgeRange } from 'src/entities/age-range.entity';
import { Gender } from 'src/entities/gender.entity';
import { EngineCapacity } from 'src/entities/engine-capacity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductImage,
      User,
      DealType,
      Condition,
      SubCategory,
      Category,
      FashionCategory,
      GameCategory,
      AcademicCategory,
      AnimalCategory,
      ElectronicCategory,
      HouseCategory,
      VehicleCategory,
      PostType,
      ProductType,
      Origin,
      Material,
      Size,
      Brand,
      Color,
      Capacity,
      Warranty,
      ProductModel,
      Processor,
      RamOption,
      StorageType,
      GraphicsCard,
      Breed,
      AgeRange,
      Gender,
      EngineCapacity,
    ]),

    NotificationModule,
    forwardRef(() => GroupModule),
  ],
  providers: [ProductService],
  controllers: [ProductController],
  exports: [ProductService],
})
export class ProductModule {}
