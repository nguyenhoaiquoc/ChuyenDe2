import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../entities/favorite.entity';
import { Product } from '../entities/product.entity';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class FavoritesService {
  logger: any;
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepo: Repository<Favorite>,
    @InjectRepository(Product) // 
    private readonly productRepo: Repository<Product>,
    private readonly notificationService: NotificationService,
  ) { }

  async toggleFavorite(userId: number, productId: number) {
    
    const product = await this.productRepo.findOne({
      where: { id: productId },
      select: ['user_id'], // Chỉ cần user_id
    });

    if (!product || !product.user_id) {
      throw new NotFoundException(`Không tìm thấy sản phẩm ${productId} hoặc chủ nhân.`);
    }
    // Giờ 'productOwnerId' đã tồn tại ở scope này
    const productOwnerId = Number(product.user_id);

    // 2. Kiểm tra xem đã "tim" chưa
    const existingFavorite = await this.favoriteRepo.findOne({
      where: { user_id: userId, product_id: productId },
    });

    if (existingFavorite) {
      // BỎ THÍCH
      await this.favoriteRepo.remove(existingFavorite);
      // GỌI HÀM XÓA 
      this.notificationService.deleteNotificationOnUnlike(userId, productId, productOwnerId)
        .catch(err => this.logger.error(`Lỗi (từ service) deleteNotificationOnUnlike: ${err.message}`));

      return { favorited: false, message: 'Đã bỏ yêu thích sản phẩm.' };
    } else {
      const newFavorite = this.favoriteRepo.create({
        user_id: userId,
        product_id: productId,
      });
      await this.favoriteRepo.save(newFavorite);
      this.sendFavoriteNotifications(userId, productId, productOwnerId)
        .catch(err => this.logger.error(`Lỗi (từ service) sendFavoriteNotifications: ${err.message}`));

      return { favorited: true, message: 'Đã thêm vào yêu thích.' };
    }
  }


  // ✅ HÀM GỬI THÔNG BÁO (PRIVATE)
  private async sendFavoriteNotifications(actorId: number, productId: number, productOwnerId: number) {
    try {
      // 1. Gửi thông báo cho chủ sản phẩm
      if (actorId !== productOwnerId) {
        await this.notificationService.notifyProductOwnerOfFavorite(
          actorId,
          productId,
          productOwnerId,
        );
      }

      // 2. Gửi thông báo xác nhận cho người thả tim
      await this.notificationService.notifyUserOfFavoriteConfirmation(
        actorId,
        productId,
      );

    } catch (error) {
      this.logger.error(`Lỗi khi gửi thông báo favorite: ${error.message}`, error.stack);
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
