import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductStatusService } from './product-status.service';
import { ProductStatus } from 'src/entities/product-status.entity';
import { ProductStatusController } from './product-status.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductStatus])], 
  providers: [ProductStatusService], 
  controllers: [ProductStatusController], 
  exports: [ProductStatusService], 
})
export class ProductStatusModule {}