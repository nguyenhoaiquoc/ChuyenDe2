import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Processor } from 'src/entities/processor.entity';
import { ProcessorController } from './processor.controller';
import { ProcessorService } from './processor.service';

@Module({
  imports: [TypeOrmModule.forFeature([Processor])],
  controllers: [ProcessorController],
  providers: [ProcessorService],
  exports: [ProcessorService],
})
export class ProcessorModule {}