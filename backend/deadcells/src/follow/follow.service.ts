import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationService } from 'src/notification/notification.service';
import { User } from 'src/entities/user.entity';
import { Follower } from 'src/entities/follower.entity';

@Injectable()
export class FollowService {
  private readonly logger = new Logger(FollowService.name);

  constructor(
    @InjectRepository(Follower)
    private readonly followerRepo: Repository<Follower>,
    private readonly notificationService: NotificationService,
  ) {}

  async toggleFollow(followerId: number, followingId: number) {
    // Không cho phép tự follow chính mình
    if (followerId === followingId) {
      return {
        isFollowing: false,
        message: 'Không thể tự theo dõi chính mình.',
        followerCount: await this.getFollowerCountNumber(followingId),
      };
    }

    const existingFollow = await this.followerRepo.findOne({
      where: {
        follower: { id: followerId },
        following: { id: followingId },
      },
    });

    if (existingFollow) {
      // Đã follow -> Hủy (Unfollow)
      await this.followerRepo.remove(existingFollow);
      const followerCount = await this.getFollowerCountNumber(followingId);
      return {
        isFollowing: false,
        message: 'Đã hủy theo dõi.',
        followerCount,
      };
    } else {
      // Chưa follow -> Theo dõi (Follow)
      const newFollow = this.followerRepo.create({
        follower: { id: followerId },
        following: { id: followingId },
      });
      await this.followerRepo.save(newFollow);

      // Gửi thông báo (async, không block)
      this.notificationService
        .notifyUserOfNewFollower(followerId, followingId)
        .catch((err) => this.logger.error(`Lỗi notifyFollow: ${err.message}`));

      const followerCount = await this.getFollowerCountNumber(followingId);
      return {
        isFollowing: true,
        message: 'Theo dõi thành công.',
        followerCount,
      };
    }
  }

  // Hàm kiểm tra trạng thái follow
  async checkFollowStatus(followerId: number, followingId: number) {
    const isFollowing = await this.followerRepo.exist({
      where: {
        follower: { id: followerId },
        following: { id: followingId },
      },
    });
    return { isFollowing };
  }

  // Hàm helper trả về số (dùng nội bộ)
  private async getFollowerCountNumber(userId: number): Promise<number> {
    return this.followerRepo.count({
      where: { following: { id: userId } },
    });
  }

  // Đếm số người theo dõi user này
  async getFollowerCount(userId: number): Promise<{ count: number }> {
    const count = await this.getFollowerCountNumber(userId);
    return { count };
  }

  // Đếm số người user này đang theo dõi
  async getFollowingCount(userId: number): Promise<{ count: number }> {
    const count = await this.followerRepo.count({
      where: { follower: { id: userId } },
    });
    return { count };
  }

  // Lấy danh sách người theo dõi user này
  async getFollowers(userId: number): Promise<User[]> {
    const follows = await this.followerRepo.find({
      where: { following: { id: userId } },
      relations: ['follower'],
    });
    return follows.map((f) => f.follower);
  }

  // Lấy danh sách người mà user này đang theo dõi
  async getFollowing(userId: number): Promise<User[]> {
    const follows = await this.followerRepo.find({
      where: { follower: { id: userId } },
      relations: ['following'],
    });
    return follows.map((f) => f.following);
  }
}
