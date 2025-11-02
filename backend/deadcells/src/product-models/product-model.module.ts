import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModel } from 'src/entities/product-model.entity'; 
import { ProductModelController } from './product-model.controller'; 
import { ProductModelService } from './product-model.service'; 

@Module({
  imports: [TypeOrmModule.forFeature([ProductModel])], 
  controllers: [ProductModelController], 
  providers: [ProductModelService], 
  exports: [ProductModelService], 
})
export class ProductModelModule {} 