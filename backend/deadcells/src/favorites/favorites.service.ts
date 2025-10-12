import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../entities/favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
  ) {}

  async addFavorite(userId: number, productId: number): Promise<Favorite> {
    const existing = await this.favoriteRepository.findOneBy({ user_id: userId, product_id: productId });
    if (existing) {
      return existing; // Nếu đã thích thì không làm gì, trả về cái đã có
    }
    const newFavorite = this.favoriteRepository.create({ user_id: userId, product_id: productId });
    return this.favoriteRepository.save(newFavorite);
  }

  async removeFavorite(userId: number, productId: number): Promise<{ deleted: boolean }> {
    await this.favoriteRepository.delete({ user_id: userId, product_id: productId });
    return { deleted: true };
  }

  async countFavorites(productId: number): Promise<{ count: number }> {
    const count = await this.favoriteRepository.count({ where: { product_id: productId } });
    return { count };
  }

  async isFavorite(userId: number, productId: number): Promise<boolean> {
    const favorite = await this.favoriteRepository.findOneBy({ user_id: userId, product_id: productId });
    return !!favorite; // Chuyển đổi sang boolean (true nếu tồn tại, false nếu không)
  }
}