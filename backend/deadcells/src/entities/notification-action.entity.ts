import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Notification } from './notification.entity';

@Entity({ name: 'notification_actions' })
export class NotificationAction {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  name: string; 

  @OneToMany(() => Notification, (notification) => notification.action)
  notifications: Notification[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}