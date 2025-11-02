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
  id: number;

  /** --------- Quan hệ phòng chat --------- */
  @Column({ name: 'conversation_id', type: 'bigint', nullable: true }) // ✅ cho phép null để sync không lỗi
  conversation_id: number | null;

  @ManyToOne(() => ConversationRoom, (c) => c.messages, {
    onDelete: 'CASCADE',
    nullable: true, // ✅
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation?: ConversationRoom | null;

  /** --------- Người gửi / nhận --------- */
  @Column({ name: 'sender_id', type: 'bigint', nullable: true }) // ✅
  sender_id: number | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true }) // ✅
  @JoinColumn({ name: 'sender_id' })
  sender?: User | null;

  @Column({ name: 'receiver_id', type: 'bigint', nullable: true }) // ✅
  receiver_id: number | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true }) // ✅
  @JoinColumn({ name: 'receiver_id' })
  receiver?: User | null;

  /** --------- Liên kết sản phẩm --------- */
  @Column({ name: 'product_id', type: 'bigint', nullable: true })
  product_id: number | null;

  @ManyToOne(() => Product, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'product_id' })
  product?: Product | null;

  /** --------- Nội dung tin nhắn --------- */
  @Column({ name: 'message_type', type: 'text', default: 'TEXT' })
  message_type: MessageType;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ name: 'media_url', type: 'text', nullable: true })
  media_url: string | null;

  @Column({ type: 'jsonb', nullable: true })
  meta: Record<string, any> | null;

  /** --------- Chỉnh sửa --------- */
  @Column({ name: 'is_edited', type: 'boolean', default: false })
  is_edited: boolean;

  @Column({ name: 'edited_at', type: 'timestamptz', nullable: true })
  edited_at: Date | null;

  @Column({ name: 'edit_count', type: 'int', default: 0 })
  edit_count: number;

  /** --------- Version cho optimistic lock --------- */
  @VersionColumn({ name: 'version', default: 1, nullable: true }) // ✅ thêm default và nullable để không lỗi sync
  version: number;

  /** --------- Đọc tin --------- */
  @Column({ name: 'is_read', type: 'boolean', default: false })
  is_read: boolean;

  @Column({ name: 'is_recalled', type: 'boolean', default: false })
is_recalled: boolean;

@Column({ name: 'recalled_by', type: 'bigint', nullable: true })
recalled_by: number | null;

@Column({ name: 'recalled_at', type: 'timestamptz', nullable: true })
recalled_at: Date | null;

@ManyToOne(() => Message, { onDelete: 'SET NULL', nullable: true })
@JoinColumn({ name: 'reply_to_id' })
reply_to?: Message | null;

@Column({ name: 'reply_to_id', type: 'bigint', nullable: true })
reply_to_id: number | null;


  /** --------- Thời gian tạo / cập nhật --------- */
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;
}
