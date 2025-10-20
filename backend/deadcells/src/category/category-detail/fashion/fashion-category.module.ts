import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FashionCategory } from 'src/entities/categories/fashion-category.entity';
import { FashionCategoryController } from './fashion-category.controller';
import { FashionCategoryService } from './fashion-category.service';


@Module({
  imports: [TypeOrmModule.forFeature([FashionCategory])],
  providers: [FashionCategoryService],
  controllers: [FashionCategoryController],
})
export class FashionCategoryModule {}
