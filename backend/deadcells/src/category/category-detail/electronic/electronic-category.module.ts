import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElectronicCategoryService } from './electronic-category.service';
import { ElectronicCategoryController } from './electronic-category.controller';
import { ElectronicCategory } from 'src/entities/categories/electronic-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ElectronicCategory])],
  providers: [ElectronicCategoryService],
  controllers: [ElectronicCategoryController],
})
export class ElectronicCategoryModule {}
