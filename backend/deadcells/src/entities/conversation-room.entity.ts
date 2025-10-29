// src/entities/conversation-room.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Message } from './message.entity';
import { Product } from './product.entity';
import { ConversationParticipant } from './conversation-participant.entity';

export type RoomType = 'PAIR' | 'GROUP';

@Entity({ name: 'conversation_rooms' })
@Index('idx_room_seller_buyer_last', ['seller_id', 'buyer_id', 'last_message_at'])
@Index('idx_room_last_at', ['last_message_at'])
@Index('uq_room_pair_with_type', ['seller_id', 'buyer_id', 'room_type'], { unique: true }) // ✅ 1 room/1 cặp khi room_type='PAIR'
export class ConversationRoom {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  // Chuẩn bị cho group (chưa dùng bây giờ)
  @Column({ name: 'room_type', type: 'text', default: 'PAIR' })
  room_type: RoomType;

  // Dùng cho PAIR
  @Column({ name: 'seller_id', type: 'bigint', nullable: true })
  seller_id: string | null;

  @Column({ name: 'buyer_id', type: 'bigint', nullable: true })
  buyer_id: string | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'seller_id' })
  seller?: User | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'buyer_id' })
  buyer?: User | null;

  @Column({ type: 'smallint', default: 1 })
  status: number; // 1: active, 0: archived/closed

  @Column({ name: 'last_message_id', type: 'bigint', nullable: true })
  last_message_id: string | null;

  @ManyToOne(() => Message, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'last_message_id' })
  last_message?: Message | null;

  // để chatlist show context sản phẩm gần nhất (optional)
  @Column({ name: 'last_product_id', type: 'bigint', nullable: true })
  last_product_id: string | null;

  @ManyToOne(() => Product, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'last_product_id' })
  last_product?: Product | null;

  @Column({ name: 'last_message_at', type: 'timestamptz', nullable: true })
  last_message_at: Date | null;

  // Cho group (tương lai) – hiện chưa dùng
  @Column({ type: 'text', nullable: true })
  title: string | null;

  @Column({ name: 'created_by', type: 'bigint', nullable: true })
  created_by: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator?: User | null;

  @Column({ name: 'group_avatar', type: 'text', nullable: true })
  group_avatar: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;

  @OneToMany(() => ConversationParticipant, (p) => p.conversation)
  participants: ConversationParticipant[];

  @OneToMany(() => Message, (m) => m.conversation)
  messages: Message[];
}
