import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Condition } from 'src/entities/condition.entity';
import { ConditionController } from './condition.controller';
import { ConditionService } from './condition.service';

@Module({
  imports: [TypeOrmModule.forFeature([Condition])],
  controllers: [ConditionController],
  providers: [ConditionService],
  exports: [ConditionService],
})
export class ConditionModule {}
