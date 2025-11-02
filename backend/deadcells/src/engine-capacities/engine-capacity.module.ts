import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EngineCapacity } from 'src/entities/engine-capacity.entity';
import { EngineCapacityController } from './engine-capacity.controller';
import { EngineCapacityService } from './engine-capacity.service';

@Module({
  imports: [TypeOrmModule.forFeature([EngineCapacity])],
  controllers: [EngineCapacityController],
  providers: [EngineCapacityService],
  exports: [EngineCapacityService],
})
export class EngineCapacityModule {}