import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphicsCard } from 'src/entities/graphics-card.entity';
import { GraphicsCardController } from './graphics-card.controller';
import { GraphicsCardService } from './graphics-card.service';

@Module({
  imports: [TypeOrmModule.forFeature([GraphicsCard])],
  controllers: [GraphicsCardController],
  providers: [GraphicsCardService],
  exports: [GraphicsCardService],
})
export class GraphicsCardModule {}