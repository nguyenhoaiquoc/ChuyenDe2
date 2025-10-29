import {
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('toggle/:productId')
  toggleFavorite(
    @Param('productId', ParseIntPipe) productId: number,
    @Req() req: any, // Sử dụng Request để lấy thông tin user
  ) {
    // const userId = req.user.id; // Dòng này sẽ hoạt động khi có AuthGuard
    const userId = 1; // Tạm thời hardcode để test

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
    @Req() req: any,
  ) {
    const userId = 1; // lấy từ req.user.id
    return this.favoritesService.isFavorite(userId, productId);
  }
}
