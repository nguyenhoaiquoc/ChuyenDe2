import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany, 
} from 'typeorm';
import { Product } from './product.entity';
import { User } from './user.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => Product, (product) => product.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  created_at: Date;

  // Cột parent_id để lưu ID của bình luận cha
  @Column({ type: 'bigint', name: 'parent_id', nullable: true })
  parent_id: number | null;

  // Quan hệ: Một bình luận cha (parent)
  @ManyToOne(() => Comment, (comment) => comment.children, {
    onDelete: 'CASCADE', // Xóa các con nếu cha bị xóa
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Comment;

  // Quan hệ: Nhiều bình luận con (children/replies)
  @OneToMany(() => Comment, (comment) => comment.parent)
  children: Comment[];

}