import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Notification } from 'src/entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Product } from 'src/entities/product.entity';
import { NotificationAction } from 'src/entities/notification-action.entity';
import { TargetType } from 'src/entities/target-type.entity';
import { NotificationGateway } from './notification.gateway';
import { User } from 'src/entities/user.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(NotificationAction)
    private readonly actionRepo: Repository<NotificationAction>,
    @InjectRepository(TargetType)
    private readonly targetTypeRepo: Repository<TargetType>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly notificationGateway: NotificationGateway, 
  ) {}

  /**
   * Hàm này được gọi bởi các service khác (CommentService, MessageService...)
   */
  async create(dto: CreateNotificationDto): Promise<Notification> {
    const newNotification = this.notificationRepo.create({
      user: { id: dto.userId },
      actor: { id: dto.actorId },
      action: { id: dto.actionId },
      targetType: { id: dto.targetTypeId },
      target_id: dto.targetId,
      product: dto.productId ? { id: dto.productId } : undefined,
      is_read: false,
    });
    // LƯU LẦN 1
    const savedNotification = await this.notificationRepo.save(newNotification);

    // GỌI HÀM PUSH SAU KHI TẠO
    this.pushNewUnreadCount(dto.userId);

    //  Trả về cái đã lưu, không save 2 lần
    return savedNotification;
  }

  // HÀM : Thông báo cho chính người đăng
  async notifyUserOfPostSuccess(product: Product) {
    try {
      const action = await this.actionRepo.findOneByOrFail({ name: 'post_success' });
      const targetType = await this.targetTypeRepo.findOneByOrFail({ name: 'product' });
      const dto: CreateNotificationDto = {
        userId: Number(product.user_id),
        actorId: Number(product.user_id),
        actionId: action.id,
        targetTypeId: targetType.id,
        targetId: product.id,
        productId: product.id,
      };
      await this.create(dto); // 👈 Hàm create() ở trên sẽ tự động push
    } catch (error) {
      this.logger.error(`Lỗi tạo thông báo post_success: ${error.message}`, error.stack);
    }
  }

  // HÀM: Thông báo cho chủ sản phẩm khi có người thích
  async notifyProductOwnerOfFavorite(actorId: number, productId: number, productOwnerId: number) {
    try {
      const action = await this.actionRepo.findOneByOrFail({ name: 'favorite_product' });
      const targetType = await this.targetTypeRepo.findOneByOrFail({ name: 'product' });
      const dto: CreateNotificationDto = {
        userId: productOwnerId,
        actorId: actorId,
        actionId: action.id,
        targetTypeId: targetType.id,
        targetId: productId,
        productId: productId,
      };
      await this.create(dto); // 👈 Hàm create() ở trên sẽ tự động push
    } catch (error) {
      this.logger.error(`Lỗi tạo thông báo favorite_product: ${error.message}`, error.stack);
    }
  }

  // HÀM: Gửi xác nhận cho người vừa thả tim
  async notifyUserOfFavoriteConfirmation(actorId: number, productId: number) {
    try {
      const action = await this.actionRepo.findOneByOrFail({ name: 'favorite_confirmation' });
      const targetType = await this.targetTypeRepo.findOneByOrFail({ name: 'product' });
      const dto: CreateNotificationDto = {
        userId: actorId,
        actorId: actorId,
        actionId: action.id,
        targetTypeId: targetType.id,
        targetId: productId,
        productId: productId,
      };
      await this.create(dto); // 👈 Hàm create() ở trên sẽ tự động push
    } catch (error) {
      this.logger.error(`Lỗi tạo thông báo favorite_confirmation: ${error.message}`, error.stack);
    }
  }

  // HÀM: Thông báo cho (Admin)
  async notifyAdminsOfNewPost(product: Product) {
    try {
      const action = await this.actionRepo.findOneByOrFail({ name: 'admin_new_post' });
      const targetType = await this.targetTypeRepo.findOneByOrFail({ name: 'product' });
      const admins = await this.userRepo.findBy({ roleId: 1 });
      if (admins.length === 0) {
        this.logger.warn('Không tìm thấy Admin (role_id=1) để gửi thông báo.');
        return;
      }
      const notifications = admins.map(admin => {
        if (admin.id === product.user_id) return null;
        const dto: CreateNotificationDto = {
          userId: admin.id,
          actorId: Number(product.user_id),
          actionId: action.id,
          targetTypeId: targetType.id,
          targetId: product.id,
          productId: product.id,
        };
        return this.create(dto); // 👈 Hàm create() ở trên sẽ tự động push
      });
      await Promise.allSettled(notifications.filter(n => n !== null));
    } catch (error) {
      this.logger.error(`Lỗi tạo thông báo admin_new_post: ${error.message}`, error.stack);
    }
  }

  // HÀM: Xóa thông báo khi người dùng Bỏ thích (Hủy tim)
  async deleteNotificationOnUnlike(actorId: number, productId: number, productOwnerId: number) {
    try {
      const confirmAction = await this.actionRepo.findOneBy({ name: 'favorite_confirmation' });
      const productAction = await this.actionRepo.findOneBy({ name: 'favorite_product' });
      const targetType = await this.targetTypeRepo.findOneBy({ name: 'product' });
      if (!confirmAction || !productAction || !targetType) {
        this.logger.warn(`Không tìm thấy action/target type để xóa thông báo 'unlike'`);
        return;
      }
      
      // 1. Xóa thông báo XÁC NHẬN (của người thả tim)
      await this.notificationRepo.delete({
        user: { id: actorId },
        actor: { id: actorId },
        action: { id: confirmAction.id },
        targetType: { id: targetType.id },
        target_id: productId,
      });
      // ✅ THÊM PUSH (cho người thả tim)
      this.pushNewUnreadCount(actorId); 

      // 2. Xóa thông báo CHO CHỦ BÀI
      if (actorId !== productOwnerId) {
        await this.notificationRepo.delete({
          user: { id: productOwnerId },
          actor: { id: actorId },
          action: { id: productAction.id },
          targetType: { id: targetType.id },
          target_id: productId,
        });
        // ✅ THÊM PUSH (cho chủ bài)
        this.pushNewUnreadCount(productOwnerId); 
      }
      this.logger.log(`Đã xóa thông báo 'unlike' cho actor ${actorId} và product ${productId}`);
    } catch (error) {
      this.logger.error(`Lỗi khi xóa thông báo 'unlike': ${error.message}`, error.stack);
    }
  }

  // HÀM: Xóa tất cả thông báo
  async deleteAllForUser(userId: number) {
    try {
      const deleteResult = await this.notificationRepo.delete({
        user: { id: userId },
      });
      
      // ✅ THÊM PUSH
      this.pushNewUnreadCount(userId); 

      this.logger.log(`Đã xóa ${deleteResult.affected} thông báo cho user ${userId}`);
      return { message: 'Đã xóa tất cả thông báo.', count: deleteResult.affected };
    } catch (error) {
      this.logger.error(`Lỗi khi xóa thông báo cho user ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  // HÀM: Lấy tất cả thông báo (cho app React Native)
  async getNotificationsForUser(userId: number, tab?: string): Promise<Notification[]> {
    const whereCondition: any = { user: { id: userId } };
    if (tab === 'news') {
      whereCondition.action = { name: 'admin_new_post' };
    } else {
      whereCondition.action = { name: Not('admin_new_post') };
    }
    return this.notificationRepo.find({
      where: whereCondition,
      relations: ['actor', 'action', 'product', 'targetType'],
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  // HÀM: Đánh dấu một thông báo là đã đọc
  async markAsRead(notificationId: number, userId: number) {
    const updateResult = await this.notificationRepo.update(
      { id: notificationId, user: { id: userId } },
      { is_read: true },
    );

    // ✅ THÊM PUSH
    this.pushNewUnreadCount(userId);

    return updateResult;
  }

  // HÀM: Đánh dấu TẤT CẢ là đã đọc
  async markAllAsRead(userId: number) {
    try {
      const updateResult = await this.notificationRepo.update(
        { user: { id: userId }, is_read: false },
        { is_read: true },
      );
      
      // ✅ THÊM PUSH
      this.pushNewUnreadCount(userId);
      
      this.logger.log(`Đã đánh dấu ${updateResult.affected} thông báo là đã đọc cho user ${userId}`);
      return { message: 'Đã đánh dấu tất cả là đã đọc.', count: updateResult.affected };
    } catch (error) {
      this.logger.error(`Lỗi khi đánh dấu tất cả là đã đọc: ${error.message}`, error.stack);
      throw error;
    }
  }

  // HÀM: Lấy SỐ LƯỢNG chưa đọc
  async getUnreadCount(userId: number): Promise<{ count: number }> {
    try {
      const count = await this.notificationRepo.count({
        where: {
          user: { id: userId },
          is_read: false,
        },
      });
      return { count };
    } catch (error) {
      this.logger.error(`Lỗi khi đếm thông báo chưa đọc: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * HÀM HELPER (ĐỂ PUSH REAL-TIME)
   * Lấy số lượng mới nhất và PUSH cho user
   */
  private async pushNewUnreadCount(userId: number) {
    try {
      // Lấy số lượng 'chưa đọc' mới nhất
      const { count } = await this.getUnreadCount(userId); 
      // Gọi Gateway để "đẩy" (push) số này
      this.notificationGateway.sendUnreadCountToUser(userId, count);
    } catch (error) {
      this.logger.error(`Lỗi khi push unread count cho user ${userId}: ${error.message}`);
    }
  }

}