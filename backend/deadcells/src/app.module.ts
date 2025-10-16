import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { ElectronicCategoryModule } from './category/category-detail/electronic/electronic-category.module';
import { AcademicCategoryModule } from './category/category-detail/academic/academic-category.module';
import { FashionCategoryModule } from './category/category-detail/fashion/fashion-category.module';
import { HouseCategoryModule } from './category/category-detail/house/house-category.module';
import { AnimalCategoryModule } from './category/category-detail/animal/animal-category.module';
import { VehicleCategoryModule } from './category/category-detail/vehicle/vehicle-category.module';
import { GameCategoryModule } from './category/category-detail/game/game-category.module';
import { ProductImageModule } from './product-image/product-image.module';
import { ConditionModule } from './condition/condition.module';
import { DealTypeModule } from './dealType/deal-type.module';
import { SubCategoryModule } from './sub-category/sub-category.module';
import { AuthModule } from './auth/auth.module';
import { ReportModule } from './report/report.module';
import { ConfigModule } from '@nestjs/config';
import { ProductTypeModule } from './product-types/product-type.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '3307', 10),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    ProductModule,
    CategoryModule,
    ElectronicCategoryModule,
    AcademicCategoryModule,
    FashionCategoryModule,
    HouseCategoryModule,
    AnimalCategoryModule,
    VehicleCategoryModule,
    GameCategoryModule,
    ProductImageModule,
    ConditionModule,
    DealTypeModule,
    SubCategoryModule,
    AuthModule,
    ReportModule,
    ProductTypeModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
