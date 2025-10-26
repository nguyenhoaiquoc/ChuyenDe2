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
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
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
    ProductTypeModule,
    UsersModule,
    ChatModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }