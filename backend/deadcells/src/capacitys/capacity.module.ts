import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Capacity } from 'src/entities/capacity.entity'; 
import { CapacityController } from './capacity.controller'; 
import { CapacityService } from './capacity.service';

@Module({
  imports: [TypeOrmModule.forFeature([Capacity])],
  controllers: [CapacityController],
  providers: [CapacityService], 
  exports: [CapacityService], 
})
export class CapacityModule {} 