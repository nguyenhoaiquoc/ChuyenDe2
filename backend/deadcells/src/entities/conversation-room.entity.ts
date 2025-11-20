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
@Index('idx_unique_pair', ['room_type'], { unique: false })
@Entity({ name: 'conversation_rooms' })
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

  @Column({ type: 'text', nullable: true })
  title: string | null;

  @Column({ type: 'text', nullable: true })
  group_avatar: string | null;

  @Column({ type: 'bigint', nullable: true })
  last_message_id: number | null;

  @ManyToOne(() => Message, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'last_message_id' })
  last_message?: Message | null;

  @Column({ type: 'timestamptz', nullable: true })
  last_message_at: Date | null;

  @Column({ type: 'int', default: 0 })
  participants_count: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToMany(() => ConversationParticipant, (p) => p.conversation)
  participants: ConversationParticipant[];

  @OneToMany(() => Message, (m) => m.conversation)
  messages: Message[];
}