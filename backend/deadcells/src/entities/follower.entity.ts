// src/entities/follower.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { User } from './user.entity';
  
  @Entity({ name: 'followers' })
  export class Follower {
    @PrimaryGeneratedColumn('increment')
    id: number;
  
    // Người đi theo dõi (LÀ BẠN)
    @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'follower_id' }) // Tên cột
    follower: User;
  
    // Người được theo dõi (LÀ NGƯỜI TA)
    @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'following_id' }) // Tên cột
    following: User;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  }