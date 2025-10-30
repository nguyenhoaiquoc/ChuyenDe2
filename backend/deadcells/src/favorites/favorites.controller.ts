import {
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';


@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('toggle/:productId')
  toggleFavorite(
    @Param('productId', ParseIntPipe) productId: number,
    @Body('userId', ParseIntPipe) userId: number,
  ) {
    return this.favoritesService.toggleFavorite(userId, productId);
  }

  @Get(':productId/count')
  countFavorites(@Param('productId', ParseIntPipe) productId: number) {
    return this.favoritesService.countFavorites(productId);
  }

  @Get('user/:userId')
  async getFavoritesByUser(@Param('userId', ParseIntPipe) userId: number) {
    const productIds =
      await this.favoritesService.getFavoriteProductIdsByUser(userId);
    return { productIds };
  }

  @Get('check/:productId')
  async checkFavorite(
    @Param('productId', ParseIntPipe) productId: number,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.favoritesService.isFavorite(userId, productId);
  }
}
