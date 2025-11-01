import { Controller, Post, Get, Param, Body, ParseIntPipe } from '@nestjs/common';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
export class FavoritesController {
    constructor(private readonly favoritesService: FavoritesService) {}

    /**
     * 🚀 TOGGLE YÊU THÍCH: POST /favorites/toggle
     * Sửa: Thêm ParseIntPipe cho các tham số từ Body
     */
    @Post('toggle')
    async toggleFavorite(
        // ✅ SỬA: Thêm ParseIntPipe cho userId và productId
        @Body('userId', ParseIntPipe) userId: number,
        @Body('productId', ParseIntPipe) productId: number,
    ) {
        return this.favoritesService.toggleFavorite(userId, productId);
    }

    // Các route khác đã có ParseIntPipe cho tham số @Param, nên giữ nguyên
    @Get('count/:productId')
    async countFavorites(@Param('productId', ParseIntPipe) productId: number) {
        return this.favoritesService.countFavorites(productId);
    }

    @Get('by-user/:userId')
    async getByUser(@Param('userId', ParseIntPipe) userId: number) {
        return this.favoritesService.getFavoriteProductIdsByUser(userId);
    }
}