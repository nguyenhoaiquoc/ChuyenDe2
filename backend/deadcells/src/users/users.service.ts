import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async findOne(id: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Người dùng với id ${id} không tồn tại`);
    }
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userRepo.find();
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const user = await this.findOne(id);

    const allowedFields = [
      'fullName',
      'phone',
      'address_json',
      'hometown',
      'gender',
      'dob',
      'nickname',
      'bio',
      'is_cccd_verified',
      'verifiedAt',
      'image',
      'coverImage',
      'citizenId',
    ] as const;

    if (data.citizenId && data.citizenId !== user.citizenId) {
      const existingUser = await this.userRepo.findOne({
        where: { citizenId: data.citizenId },
      });
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException(
          'Số CCCD này đã được đăng ký bởi người khác',
        );
      }
    }

    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        (user as any)[field] = data[field];
      }
    });

    if (data.is_cccd_verified === true && !user.is_cccd_verified) {
      user.is_cccd_verified = true;
      user.verifiedAt = new Date();
    }

    return this.userRepo.save(user);
  }

  async verifyCCCD(
    userId: number,
    cccdData: {
      fullName?: string;
      citizenId?: string;
      gender?: string;
      dob?: string;
      hometown?: string;
      address?: string;
      imageUrl?: string;
    },
  ): Promise<User> {
    console.log('CCCD DATA NHẬN VÀO:', cccdData);
    const updateData: Partial<User> = {
      is_cccd_verified: true,
      verifiedAt: new Date(),
    };

    if (cccdData.fullName) updateData.fullName = cccdData.fullName;
    if (cccdData.citizenId) updateData.citizenId = cccdData.citizenId;
    if (cccdData.gender) updateData.gender = cccdData.gender;
    if (cccdData.dob) {
      const date = new Date(cccdData.dob);
      if (!isNaN(date.getTime())) {
        updateData.dob = date;
      }
    }
    if (cccdData.hometown) updateData.hometown = cccdData.hometown;
    if (cccdData.address) {
      updateData.address_json = {
        full: cccdData.address,
        source: 'cccd_scan',
        updatedAt: new Date().toISOString(),
      };
    }

    if (cccdData.imageUrl) {
      updateData.image = cccdData.imageUrl;
    }
    console.log(updateData);

    return this.updateUser(userId, updateData);
  }
  async saveCCCDPending(
    userId: number,
    pendingData: {
      fullName?: string;
      citizenId?: string;
      gender?: string;
      dob?: string;
      hometown?: string;
      address?: string;
      imageUrl?: string;
      submittedAt?: Date;
    },
  ): Promise<User> {
    const user = await this.findOne(userId);

    if (user.cccd_pending_data) {
      // Nếu đã có pending, không overwrite
      throw new BadRequestException(
        'Thông tin CCCD của bạn đang chờ admin duyệt',
      );
    }

    user.cccd_pending_data = {
      ...pendingData,
      submittedAt: pendingData.submittedAt || new Date(),
    };

    return this.userRepo.save(user);
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

  /** XÓA đánh giá (MỚI THÊM) */
  async deleteRating(reviewerId: number, ratedUserId: number) {
    if (reviewerId === ratedUserId) {
      throw new BadRequestException('Không thể xóa đánh giá của chính mình');
    }

    const rating = await this.ratingRepo.findOne({
      where: {
        user_id: reviewerId,
        rated_user_id: ratedUserId,
      },
    });

    if (!rating) {
      throw new BadRequestException('Bạn chưa đánh giá người dùng này');
    }

    await this.ratingRepo.remove(rating);

    return {
      success: true,
      message: 'Đã xóa đánh giá thành công',
    };
  }

  async getMyRatings(userId: number) {
    const ratings = await this.ratingRepo.find({
      where: { user_id: userId },
      relations: ['ratedUser'],
      order: { created_at: 'DESC' },
    });

    return ratings.map((r) => ({
      id: r.id,
      stars: Number(r.number_stars),
      content: r.content,
      createdAt: r.created_at,
      ratedUser: {
        id: r.ratedUser.id,
        fullName: r.ratedUser.fullName,
        image: r.ratedUser.image,
      },
    }));
  }
}
