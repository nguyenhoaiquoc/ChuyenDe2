import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ConversationParticipant } from './conversation-participant.entity';
import { Message } from './message.entity';
import { User } from './user.entity';
import { Product } from './product.entity';

@Entity({ name: 'conversation_rooms' })
@Index('idx_room_seller_buyer', ['seller_id', 'buyer_id'])
export class ConversationRoom {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' , nullable:true})
  seller_id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @Column({ type: 'bigint', nullable:true })
  buyer_id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @Column({ type: 'text', default: 'PAIR' })
  room_type: 'PAIR' | 'GROUP';
    
  @Column({ type: 'bigint', nullable: true })
  product_id: number | null;

  @ManyToOne(() => Product, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'product_id' })
  product?: Product | null;

  @Column({ type: 'text', nullable: true })
  title: string | null;

  @Column({ type: 'text', nullable: true })
  group_avatar: string | null;

  @Column({ type: 'int', default: 1 })
  status: number;

  @Column({ type: 'bigint', nullable: true })
  last_message_id: number | null;

  @ManyToOne(() => Message, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'last_message_id' })
  last_message?: Message | null;

  @Column({ type: 'bigint', nullable: true })
  last_product_id: number | null;

  @ManyToOne(() => Product, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'last_product_id' })
  last_product?: Product | null;

  @Column({ type: 'timestamptz', nullable: true })
  last_message_at: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToMany(() => ConversationParticipant, (p) => p.conversation)
  participants: ConversationParticipant[];

  @OneToMany(() => Message, (m) => m.conversation)
  messages: Message[];
}
