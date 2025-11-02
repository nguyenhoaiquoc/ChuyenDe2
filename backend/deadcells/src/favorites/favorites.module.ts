import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from '../entities/favorite.entity';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { Product } from '../entities/product.entity';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    // 👇 2. THÊM "Product" VÀO MẢNG NÀY
    TypeOrmModule.forFeature([Favorite, Product]), 
    
    NotificationModule, 
  ],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}