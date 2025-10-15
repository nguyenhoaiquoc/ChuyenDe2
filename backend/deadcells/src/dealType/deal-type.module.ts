import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DealType } from 'src/entities/deal-type.entity';
import { DealTypeController } from './deal-type.controller';
import { DealTypeService } from './deal-type.service';

@Module({
  imports: [TypeOrmModule.forFeature([DealType])],
  controllers: [DealTypeController],
  providers: [DealTypeService],
  exports: [DealTypeService],
})
export class DealTypeModule {}
