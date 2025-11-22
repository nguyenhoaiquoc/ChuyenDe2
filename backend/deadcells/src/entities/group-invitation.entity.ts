import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Group } from './group.entity';
import { User } from './user.entity';

@Entity('group_invitations')
export class GroupInvitation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'group_id' })
  group_id: number;

  @Column({ name: 'inviter_id' })
  inviter_id: number;

  @Column({ name: 'invitee_id' })
  invitee_id: number;

  /**
   * Trạng thái lời mời:
   * 1 = pending (chờ phản hồi)
   * 2 = accepted (đã chấp nhận)
   * 3 = rejected (đã từ chối)
   */
  @Column({ type: 'smallint', default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => Group, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inviter_id' })
  inviter: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invitee_id' })
  invitee: User;
}
