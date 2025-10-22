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

  // @UseGuards(AuthGuard('jwt')) // ❗️ Sau này bạn phải thêm dòng này
  @Post('toggle/:productId')
  toggleFavorite(
    @Param('productId', ParseIntPipe) productId: number,
    @Req() req: any, // Sử dụng Request để lấy thông tin user
  ) {
    // ❗️ Quan trọng: Lấy userId từ auth token thay vì hardcode
    // const userId = req.user.id; // Dòng này sẽ hoạt động khi có AuthGuard
    const userId = 1; // Tạm thời hardcode để test

    return this.favoritesService.toggleFavorite(userId, productId);
  }

  @Get(':productId/count')
  countFavorites(@Param('productId', ParseIntPipe) productId: number) {
    return this.favoritesService.countFavorites(productId);
  }
}
