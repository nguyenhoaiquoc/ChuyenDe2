import { Controller, Post, Delete, Get, Param, ParseIntPipe } from '@nestjs/common';
// Bỏ hết các import không cần thiết như AuthGuard, Req
import { FavoritesService } from './favorites.service';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':productId')
  addFavorite(@Param('productId', ParseIntPipe) productId: number) {
    const userId = 1;
    return this.favoritesService.addFavorite(userId, productId);
  }

  @Delete(':productId')
  removeFavorite(@Param('productId', ParseIntPipe) productId: number) {
    const userId = 1; 
    return this.favoritesService.removeFavorite(userId, productId);
  }

  @Get(':productId/count')
  countFavorites(@Param('productId', ParseIntPipe) productId: number) {
    return this.favoritesService.countFavorites(productId);
  }

  @Get(':productId/check')
  checkFavorite(@Param('productId', ParseIntPipe) productId: number) {
    const userId = 1; 
    return this.favoritesService.isFavorite(userId, productId);
  }
}