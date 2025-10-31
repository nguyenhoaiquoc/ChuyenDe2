import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageType } from 'src/entities/storage-type.entity';
import { StorageTypeController } from './storage-type.controller';
import { StorageTypeService } from './storage-type.service';

@Module({
  imports: [TypeOrmModule.forFeature([StorageType])],
  controllers: [StorageTypeController],
  providers: [StorageTypeService],
  exports: [StorageTypeService],
})
export class StorageTypeModule {}