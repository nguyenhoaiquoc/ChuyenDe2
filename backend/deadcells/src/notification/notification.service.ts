import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Notification } from 'src/entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Product } from 'src/entities/product.entity';
import { NotificationAction } from 'src/entities/notification-action.entity';
import { TargetType } from 'src/entities/target-type.entity';

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
    ) { }

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

        return this.notificationRepo.save(newNotification);
    }

    // HÀM : Thông báo cho chính người đăng
    async notifyUserOfPostSuccess(product: Product) {
        try {
            // Lấy ID từ DB (không "giả sử" nữa)
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
            await this.create(dto);

        } catch (error) {
            this.logger.error(`Lỗi tạo thông báo post_success: ${error.message}`, error.stack);
        }
    }

    /**
   * 5. HÀM MỚI: Thông báo cho chủ sản phẩm khi có người thích
   */
    async notifyProductOwnerOfFavorite(actorId: number, productId: number, productOwnerId: number) {
        try {
            const action = await this.actionRepo.findOneByOrFail({ name: 'favorite_product' });
            const targetType = await this.targetTypeRepo.findOneByOrFail({ name: 'product' });

            const dto: CreateNotificationDto = {
                userId: productOwnerId, // Người nhận là chủ SP
                actorId: actorId,       // Người thực hiện là người thả tim
                actionId: action.id,
                targetTypeId: targetType.id,
                targetId: productId,
                productId: productId,
            };
            await this.create(dto);

        } catch (error) {
            this.logger.error(`Lỗi tạo thông báo favorite_product: ${error.message}`, error.stack);
        }
    }

    /**
     * 6. HÀM MỚI: Gửi xác nhận cho người vừa thả tim
     */
    async notifyUserOfFavoriteConfirmation(actorId: number, productId: number) {
        try {
            const action = await this.actionRepo.findOneByOrFail({ name: 'favorite_confirmation' });
            const targetType = await this.targetTypeRepo.findOneByOrFail({ name: 'product' });

            const dto: CreateNotificationDto = {
                userId: actorId,         // Người nhận là người thả tim
                actorId: actorId,        // Người thực hiện cũng là người thả tim
                actionId: action.id,
                targetTypeId: targetType.id,
                targetId: productId,
                productId: productId,
            };
            await this.create(dto);

        } catch (error) {
            this.logger.error(`Lỗi tạo thông báo favorite_confirmation: ${error.message}`, error.stack);
        }
    }

    // hàm xóa tất cả thông báo 
    async deleteAllForUser(userId: number) {
    try {
      // Xóa tất cả bản ghi có user_id khớp
      const deleteResult = await this.notificationRepo.delete({
        user: { id: userId },
      });

      this.logger.log(`Đã xóa ${deleteResult.affected} thông báo cho user ${userId}`);
      return { message: 'Đã xóa tất cả thông báo.', count: deleteResult.affected };

    } catch (error) {
      this.logger.error(`Lỗi khi xóa thông báo cho user ${userId}: ${error.message}`, error.stack);
      throw error;
    }
}


    async deleteNotificationOnUnlike(actorId: number, productId: number, productOwnerId: number) {
    try {
      // 1. Lấy ID các hành động
      const confirmAction = await this.actionRepo.findOneBy({ name: 'favorite_confirmation' });
      const productAction = await this.actionRepo.findOneBy({ name: 'favorite_product' });
      const targetType = await this.targetTypeRepo.findOneBy({ name: 'product' });

      if (!confirmAction || !productAction || !targetType) {
        this.logger.warn(`Không tìm thấy action/target type để xóa thông báo 'unlike'`);
        return;
      }

      // 2. Xóa thông báo XÁC NHẬN (của người thả tim)
      await this.notificationRepo.delete({
        user: { id: actorId },
        actor: { id: actorId },
        action: { id: confirmAction.id },
        targetType: { id: targetType.id },
        target_id: productId,
      });

      // 3. Xóa thông báo CHO CHỦ BÀI (nếu người tim không phải là chủ)
      if (actorId !== productOwnerId) {
        await this.notificationRepo.delete({
          user: { id: productOwnerId },
          actor: { id: actorId },
          action: { id: productAction.id },
          targetType: { id: targetType.id },
          target_id: productId,
        });
      }
      
      this.logger.log(`Đã xóa thông báo 'unlike' cho actor ${actorId} và product ${productId}`);

    } catch (error) {
      this.logger.error(`Lỗi khi xóa thông báo 'unlike': ${error.message}`, error.stack);
    }
  }

    // 4. HÀM : Thông báo cho (Admin)

    async notifyAdminsOfNewPost(product: Product) {
        try {
            // Lấy ID từ DB
            const action = await this.actionRepo.findOneByOrFail({ name: 'admin_new_post' });
            const targetType = await this.targetTypeRepo.findOneByOrFail({ name: 'product' });

            //  GIẢ ĐỊNH: Admin có role_id = 1 (Ông sửa số 1 này nếu cần)
            const admins = await this.userRepo.findBy({ roleId: 1 });

            if (admins.length === 0) {
                this.logger.warn('Không tìm thấy Admin (role_id=1) để gửi thông báo.');
                return;
            }

            // Tạo thông báo cho từng Admin
            const notifications = admins.map(admin => {
                // Không gửi thông báo nếu Admin tự đăng bài
                if (admin.id === product.user_id) return null;

                const dto: CreateNotificationDto = {
                    userId: admin.id,
                    actorId: Number(product.user_id),
                    actionId: action.id,
                    targetTypeId: targetType.id,
                    targetId: product.id,
                    productId: product.id,
                };
                return this.create(dto); // Gọi hàm create
            });

            await Promise.allSettled(notifications.filter(n => n !== null));

        } catch (error) {
            this.logger.error(`Lỗi tạo thông báo admin_new_post: ${error.message}`, error.stack);
        }
    }

    /**
     * Lấy tất cả thông báo cho một người dùng (ví dụ: cho app React Native)
     */
    async getNotificationsForUser(userId: number, tab?: string): Promise<Notification[]> { // 👈 Thêm "tab?: string"

        // Xây dựng điều kiện WHERE cơ bản
        const whereCondition: any = { user: { id: userId } };

        // Thêm điều kiện lọc dựa trên 'tab'
        if (tab === 'news') {
            // Chỉ lấy thông báo có action là 'admin_new_post'
            whereCondition.action = { name: 'admin_new_post' };
        } else {
            // Mặc định (tab 'activity'): Lấy các thông báo KHÔNG phải là 'admin_new_post'
            whereCondition.action = { name: Not('admin_new_post') }; //  Dùng Not()
        }

        return this.notificationRepo.find({
            where: whereCondition, // 👈 Sử dụng điều kiện đã xây dựng
            relations: [
                'actor',
                'action',
                'product',
                'targetType',
            ],
            order: {
                createdAt: 'DESC',
            },
            take: 20,
        });
    }

    /**
     * Đánh dấu một thông báo là đã đọc
     */
    async markAsRead(notificationId: number, userId: number) {
        // Cập nhật, nhưng phải đảm bảo thông báo này là của đúng user đó
        return this.notificationRepo.update(
            { id: notificationId, user: { id: userId } },
            { is_read: true },
        );
    }





}