import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warranty } from 'src/entities/warranty.entity'; 
import { WarrantyController } from './warranty.controller'; 
import { WarrantyService } from './warranty.service'; 

@Module({
  imports: [TypeOrmModule.forFeature([Warranty])], 
  controllers: [WarrantyController], 
  providers: [WarrantyService], 
  exports: [WarrantyService], 
})
export class WarrantyModule {} 