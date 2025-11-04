import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameCategory } from 'src/entities/categories/game-category.entity';
import { GameCategoryService } from './game-category.service';
import { GameCategoryController } from './game-category.controller';


@Module({
  imports: [TypeOrmModule.forFeature([GameCategory])],
  providers: [GameCategoryService],
  controllers: [GameCategoryController],
})
export class GameCategoryModule {}
