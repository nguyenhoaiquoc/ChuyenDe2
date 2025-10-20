import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleCategory } from 'src/entities/categories/vehicle-category.entity';
import { VehicleCategoryService } from './vehicle-category.service';
import { VehicleCategoryController } from './vehicle-category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VehicleCategory])],
  providers: [VehicleCategoryService],
  controllers: [VehicleCategoryController],
})
export class VehicleCategoryModule {}
