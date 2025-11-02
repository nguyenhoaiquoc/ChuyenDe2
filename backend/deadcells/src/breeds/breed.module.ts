import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Breed } from 'src/entities/breed.entity';
import { BreedController } from './breed.controller';
import { BreedService } from './breed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Breed])],
  controllers: [BreedController],
  providers: [BreedService],
  exports: [BreedService],
})
export class BreedModule {}