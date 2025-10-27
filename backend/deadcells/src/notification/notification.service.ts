import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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



    // 4. HÀM : Thông báo cho "tui" (Admin)

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
    async getNotificationsForUser(userId: number): Promise<Notification[]> {
        return this.notificationRepo.find({
            where: { user: { id: userId } },
            relations: [
                'actor', // Lấy info người gây ra
                'action', // Lấy tên hành động (e.g., 'comment')
                'product', // Lấy info sản phẩm (nếu có)
                'targetType', // Lấy tên loại (e.g., 'product')
            ],
            order: {
                createdAt: 'DESC', // Sắp xếp mới nhất lên đầu
            },
            take: 20, // Lấy 20 cái gần nhất
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