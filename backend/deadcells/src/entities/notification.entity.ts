import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { NotificationAction } from './notification-action.entity';
import { TargetType } from './target-type.entity';
import { Product } from './product.entity';

@Entity({ name: 'notifications' })
export class Notification {
  @PrimaryGeneratedColumn('increment')
  id: number;

  // Người nhận thông báo
  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User; // Quan hệ tới người nhận

  // Người thực hiện hành động
  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'actor_id' })
  actor: User; // Quan hệ tới người gây ra hành động

  // Loại hành động (comment, message...)
  @ManyToOne(() => NotificationAction, (action) => action.notifications, { nullable: false })
  @JoinColumn({ name: 'action_id' })
  action: NotificationAction;

  // Loại đối tượng (product, user_profile...)
  @ManyToOne(() => TargetType, (type) => type.notifications, { nullable: false })
  @JoinColumn({ name: 'target_type_id' })
  targetType: TargetType;

  // ID của đối tượng cụ thể (ví dụ: ID của bình luận, ID của user)
  @Column({ type: 'bigint', nullable: false })
  target_id: number;

  // Sản phẩm liên quan (có thể có hoặc không)
  @ManyToOne(() => Product, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'boolean', default: false, nullable: false })
  is_read: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}