import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Express } from 'express';
import { Rating } from 'src/entities/rating.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Rating)
    private readonly ratingRepo: Repository<Rating>,
  ) {}

  // Cập nhật thông tin user + 1 ảnh avatar
  async updateUser(
    id: number,
    data: Partial<User>,
    file?: Express.Multer.File,
  ) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new Error('User không tồn tại');

    // Nếu có file upload, lưu URL vào image
    if (file) {
      user.image = file.path.startsWith('http')
        ? file.path
        : `${process.env.PATH}${file.path}`;
    }

    // Cập nhật các trường còn lại
    Object.assign(user, data);

    const updatedUser = await this.userRepo.save(user);

    return {
      id: updatedUser.id,
      name: updatedUser.fullName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      image: updatedUser.image,
      updated_at: updatedUser.updatedAt,
    };
  }

  async findAll(): Promise<User[]> {
    return await this.userRepo.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new Error('User không tồn tại');
    return user;
  }

  async searchUsersForInvite(currentUserId: number | string, search?: string) {
    const userId = Number(currentUserId);
    if (isNaN(userId)) {
      throw new BadRequestException('User ID không hợp lệ');
    }

    const query = this.userRepository
      .createQueryBuilder('user')
      .where('user.id != :currentUserId', { currentUserId: userId })
      .andWhere('user.deleted_at IS NULL')
      .andWhere('user.role_id = :roleId', { roleId: 2 }); // chỉ lấy user

    if (search) {
      query.andWhere('unaccent(user.fullName) ILIKE unaccent(:search)', {
        search: `%${search}%`,
      });
    }

    const users = await query
      .select(['user.id', 'user.fullName', 'user.image'])
      .getMany();

    return users.map((u) => ({
      id: u.id,
      name: u.fullName,
      avatar: u.image,
    }));
  }

  /** Tạo hoặc cập nhật đánh giá user */
  async rateUser(
    reviewerId: number,
    ratedUserId: number,
    stars: number,
    content?: string,
  ) {
    // Không cho tự đánh giá
    if (reviewerId === ratedUserId) {
      throw new BadRequestException('Không thể tự đánh giá bản thân');
    }

    // Kiểm tra user tồn tại
    const ratedUser = await this.userRepo.findOne({
      where: { id: ratedUserId },
    });
    if (!ratedUser) {
      throw new BadRequestException('User không tồn tại');
    }

    // Kiểm tra đã đánh giá chưa
    let rating = await this.ratingRepo.findOne({
      where: {
        user_id: reviewerId,
        rated_user_id: ratedUserId,
      },
    });

    if (rating) {
      // Cập nhật đánh giá cũ
      rating.number_stars = stars;
      rating.content = content || rating.content;
      await this.ratingRepo.save(rating);
      return {
        success: true,
        message: 'Đã cập nhật đánh giá',
        rating,
      };
    } else {
      // Tạo đánh giá mới
      rating = this.ratingRepo.create({
        user_id: reviewerId,
        rated_user_id: ratedUserId,
        number_stars: stars,
        content: content || '',
      });
      await this.ratingRepo.save(rating);
      return {
        success: true,
        message: 'Đã tạo đánh giá mới',
        rating,
      };
    }
  }

  /** Lấy danh sách đánh giá của user */
  async getUserRatings(userId: number) {
    const ratings = await this.ratingRepo
      .createQueryBuilder('rating')
      .leftJoinAndSelect('rating.reviewer', 'reviewer')
      .where('rating.rated_user_id = :userId', { userId })
      .orderBy('rating.created_at', 'DESC')
      .getMany();

    return ratings.map((r) => ({
      id: r.id,
      stars: r.number_stars,
      content: r.content,
      createdAt: r.created_at,
      reviewer: {
        id: r.reviewer.id,
        name: r.reviewer.fullName,
        avatar: r.reviewer.image,
      },
    }));
  }

  /** Lấy rating trung bình của user */
  async getUserAverageRating(userId: number) {
    const result = await this.ratingRepo
      .createQueryBuilder('rating')
      .select('AVG(rating.number_stars)', 'average')
      .addSelect('COUNT(rating.id)', 'count')
      .where('rating.rated_user_id = :userId', { userId })
      .getRawOne();

    return {
      average: result.average ? parseFloat(result.average).toFixed(1) : null,
      count: parseInt(result.count) || 0,
    };
  }

  /** Kiểm tra user đã đánh giá chưa */
  async checkUserRating(reviewerId: number, ratedUserId: number) {
    const rating = await this.ratingRepo.findOne({
      where: {
        user_id: reviewerId,
        rated_user_id: ratedUserId,
      },
    });

    return rating
      ? {
          hasRated: true,
          stars: rating.number_stars,
          content: rating.content,
        }
      : { hasRated: false };
  }
}
