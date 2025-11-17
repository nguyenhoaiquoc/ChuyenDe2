import {
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('toggle/:productId')
  toggleFavorite(
    @Req() req,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    const userId = req.user.id;
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

  @Get('my-list')
  async getFavoriteProductsByUser(
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.favoritesService.getFavoriteProductsByUser(userId);
  }
}
