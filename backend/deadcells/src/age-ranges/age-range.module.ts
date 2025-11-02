import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgeRange } from 'src/entities/age-range.entity';
import { AgeRangeController } from './age-range.controller';
import { AgeRangeService } from './age-range.service';

@Module({
  imports: [TypeOrmModule.forFeature([AgeRange])],
  controllers: [AgeRangeController],
  providers: [AgeRangeService],
  exports: [AgeRangeService],
})
export class AgeRangeModule {}