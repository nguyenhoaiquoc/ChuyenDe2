import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicCategory } from 'src/entities/categories/academic-category.entity';
import { AcademicCategoryService } from './academic-category.service';
import { AcademicCategoryController } from './academic-category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AcademicCategory])],
  providers: [AcademicCategoryService],
  controllers: [AcademicCategoryController],
})
export class AcademicCategoryModule {}
