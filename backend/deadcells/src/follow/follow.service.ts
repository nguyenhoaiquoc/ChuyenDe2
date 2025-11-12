// src/follow/follow.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follower } from 'src/entities/follower.entity';
import { NotificationService } from 'src/notification/notification.service';
import { User } from 'src/entities/user.entity';

@Injectable()
export class FollowService {
  private readonly logger = new Logger(FollowService.name);

  constructor(
    @InjectRepository(Follower)
    private readonly followerRepo: Repository<Follower>,
    private readonly notificationService: NotificationService,
  ) {}

  async toggleFollow(followerId: number, followingId: number) {
    // 1. Kiểm tra xem đã follow chưa
    const existingFollow = await this.followerRepo.findOne({
      where: {
        follower: { id: followerId },
        following: { id: followingId },
      },
    });

    if (existingFollow) {
      // 2a. Đã follow -> Hủy (Unfollow)
      await this.followerRepo.remove(existingFollow);
      // (Không cần gửi thông báo khi Hủy theo dõi)
      return { isFollowing: false, message: 'Đã hủy theo dõi.' };
    } else {
      // 2b. Chưa follow -> Theo dõi (Follow)
      const newFollow = this.followerRepo.create({
        follower: { id: followerId },
        following: { id: followingId },
      });
      await this.followerRepo.save(newFollow);
      this.notificationService.notifyUserOfNewFollower(followerId, followingId)
        .catch(err => this.logger.error(`Lỗi (từ service) notifyFollow: ${err.message}`));
        
      return { isFollowing: true, message: 'Theo dõi thành công.' };
    }
  }

  // Hàm kiểm tra trạng thái (cho frontend)
  async checkFollowStatus(followerId: number, followingId: number) {
    const isFollowing = await this.followerRepo.exist({
      where: {
        follower: { id: followerId },
        following: { id: followingId },
      },
    });
    return { isFollowing };
  }

  /**
   * ✅ HÀM MỚI: Đếm xem user này CÓ BAO NHIÊU người theo dõi
   */
  async getFollowerCount(userId: number): Promise<{ count: number }> {
    const count = await this.followerRepo.count({
      where: {
        following: { id: userId }, // Đếm xem ai đang "following" (theo dõi) user này
      },
    });
    return { count };
  }

 
//    *  HÀM MỚI: Đếm xem user này ĐANG THEO DÕI bao nhiêu người
  
  async getFollowingCount(userId: number): Promise<{ count: number }> {
    const count = await this.followerRepo.count({
      where: {
        follower: { id: userId }, 
      },
    });
    return { count };
  }

  async getFollowers(userId: number): Promise<User[]> {
    const follows = await this.followerRepo.find({
      where: {
        following: { id: userId },
      },
      relations: ['follower'],
    });
    // Trả về mảng các user là "follower"
    return follows.map(follow => follow.follower);
  }

  /** Lấy danh sách NHỮNG NGƯỜI MÀ user này đang theo dõi
   */
  async getFollowing(userId: number): Promise<User[]> {
    const follows = await this.followerRepo.find({
      where: {
        follower: { id: userId },
      },
      relations: ['following'], 
    });
    return follows.map(follow => follow.following);
  }
}

