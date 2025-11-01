import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RamOption } from 'src/entities/ram-option.entity';
import { RamOptionController } from './ram-option.controller';
import { RamOptionService } from './ram-option.service';

@Module({
  imports: [TypeOrmModule.forFeature([RamOption])],
  controllers: [RamOptionController],
  providers: [RamOptionService],
  exports: [RamOptionService],
})
export class RamOptionModule {}