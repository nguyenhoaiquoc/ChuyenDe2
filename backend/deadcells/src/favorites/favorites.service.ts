import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../entities/favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepo: Repository<Favorite>,
  ) {}

  /* Toggle trạng thái yêu thích cho một sản phẩm.
    Nếu đã thích -> Bỏ thích.
    Nếu chưa thích -> Thích. */
  async toggleFavorite(userId: number, productId: number) {
    const existingFavorite = await this.favoriteRepo.findOne({
      where: { user_id: userId, product_id: productId },
    });

    if (existingFavorite) {
      // Đã tồn tại -> Xóa đi (Bỏ thích)
      await this.favoriteRepo.remove(existingFavorite);
      return { favorited: false, message: 'Đã bỏ yêu thích sản phẩm.' };
    } else {
      // Chưa tồn tại -> Tạo mới (Thích)
      const newFavorite = this.favoriteRepo.create({
        user_id: userId,
        product_id: productId,
      });
      await this.favoriteRepo.save(newFavorite);
      return { favorited: true, message: 'Đã thêm vào yêu thích.' };
    }
  }

  // Đếm tổng số lượt yêu thích của một sản phẩm.
  async countFavorites(productId: number): Promise<{ count: number }> {
    const count = await this.favoriteRepo.count({
      where: { product_id: productId },
    });
    return { count };
  }

  //Lấy danh sách ID các sản phẩm mà một user đã thích()
  async getFavoriteProductIdsByUser(userId: number): Promise<number[]> {
    console.log(`[FavoritesService] Đang tìm lượt thích cho userId: ${userId}`);
    const favorites = await this.favoriteRepo.find({
      where: { user_id: userId },
      select: ['product_id'], // Chỉ lấy cột product_id để tối ưu
    });
    const productIds = favorites.map((fav) => fav.product_id);

    console.log(
      `[FavoritesService] Danh sách ID sản phẩm sẽ trả về:`,
      productIds,
    );

    return productIds;
  }

  // kiểm tra xem một sản phẩm có đang được người dùng yêu thích hay không.
  async isFavorite(
    userId: number,
    productId: number,
  ): Promise<{ isFavorite: boolean }> {
    const existing = await this.favoriteRepo.findOne({
      where: { user_id: userId, product_id: productId },
    });

    return { isFavorite: !!existing };
  }
}
