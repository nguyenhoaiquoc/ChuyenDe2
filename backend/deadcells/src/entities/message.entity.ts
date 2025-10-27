import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

import { User } from './user.entity';
import { Product } from './product.entity';
import { ConversationRoom } from './conversation-room.entity';

export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';

@Entity({ name: 'messages' })
@Index('idx_msg_conv_created', ['conversation_id', 'created_at'])
@Index('idx_msg_conv_product', ['conversation_id', 'product_id', 'created_at'])
export class Message {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ name: 'conversation_id', type: 'bigint' })
  conversation_id: string;

  @ManyToOne(() => ConversationRoom, (c) => c.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: ConversationRoom;

  @Column({ name: 'sender_id', type: 'bigint' })
  sender_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  // ✅ thêm phần này
  @Column({ name: 'receiver_id', type: 'bigint' })
  receiver_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;

  // Gắn ngữ cảnh sản phẩm cho từng tin (NULL nếu tin nhắn chung)
  @Column({ name: 'product_id', type: 'bigint', nullable: true })
  product_id: string | null;

  @ManyToOne(() => Product, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'product_id' })
  product?: Product | null;

  @Column({ name: 'message_type', type: 'text', default: 'TEXT' })
  message_type: MessageType;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ name: 'media_url', type: 'text', nullable: true })
  media_url: string | null;

  @Column({ type: 'jsonb', nullable: true })
  meta: Record<string, any> | null;

  // Cho phép EDIT
  @Column({ name: 'is_edited', type: 'boolean', default: false })
  is_edited: boolean;

  @Column({ name: 'edited_at', type: 'timestamptz', nullable: true })
  edited_at: Date | null;

  @Column({ name: 'edit_count', type: 'int', default: 0 })
  edit_count: number;

  // Optimistic lock để tránh ghi đè xung đột khi edit
  @VersionColumn({ name: 'version' })
  version: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;
}
