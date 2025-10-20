import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HouseCategory } from 'src/entities/categories/house-category.entity';
import { HouseCategoryService } from './house-category.service';
import { HouseCategoryController } from './house-category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HouseCategory])],
  providers: [HouseCategoryService],
  controllers: [HouseCategoryController],
})
export class HouseCategoryModule {}
