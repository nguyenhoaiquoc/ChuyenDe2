import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnimalCategory } from 'src/entities/categories/animal-category.entity';
import { AnimalCategoryService } from './animal-category.service';
import { AnimalCategoryController } from './animal-category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AnimalCategory])],
  providers: [AnimalCategoryService],
  controllers: [AnimalCategoryController],
})
export class AnimalCategoryModule {}
