import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ConversationRoom } from './conversation-room.entity';
import { User } from './user.entity';

export type ParticipantRole = 'BUYER' | 'SELLER' | 'MEMBER'; // MEMBER để sẵn cho group

@Entity({ name: 'conversation_participants' })
@Index('idx_part_user', ['user_id'])
@Index('idx_part_conv', ['conversation_id'])
@Index('uq_participant', ['conversation_id', 'user_id'], { unique: true })
export class ConversationParticipant {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ name: 'conversation_id', type: 'bigint' })
  conversation_id: string;

  @ManyToOne(() => ConversationRoom, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: ConversationRoom;

  @Column({ name: 'user_id', type: 'bigint' })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text', default: 'BUYER' })
  role: ParticipantRole;

  @Column({ name: 'last_read_at', type: 'timestamptz', nullable: true })
  last_read_at: Date | null;

  @Column({ type: 'boolean', default: false })
  muted: boolean;

  @Column({ name: 'is_archived', type: 'boolean', default: false })
  is_archived: boolean;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deleted_at: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;
}
