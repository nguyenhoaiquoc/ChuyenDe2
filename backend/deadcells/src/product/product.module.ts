import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "src/entities/product.entity";
import { ProductImage } from "src/entities/product-image.entity";
import { ProductService } from "./product.service";
import { ProductController } from "./product.controller";
import { DealType } from "src/entities/deal-type.entity";
import { Condition } from "src/entities/condition.entity";
import { SubCategory } from "src/entities/sub-category.entity";
import { Category } from "src/entities/category.entity";
import { FashionCategory } from "src/entities/categories/fashion-category.entity";
import { GameCategory } from "src/entities/categories/game-category.entity";
import { AcademicCategory } from "src/entities/categories/academic-category.entity";
import { AnimalCategory } from "src/entities/categories/animal-category.entity";
import { ElectronicCategory } from "src/entities/categories/electronic-category.entity";
import { HouseCategory } from "src/entities/categories/house-category.entity";
import { VehicleCategory } from "src/entities/categories/vehicle-category.entity";
import { FavoritesModule } from "src/favorites/favorites.module";

@Module({
  imports: [
    FavoritesModule,
    TypeOrmModule.forFeature([
      Product,
      ProductImage,
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
    ]),
  ],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule { }
