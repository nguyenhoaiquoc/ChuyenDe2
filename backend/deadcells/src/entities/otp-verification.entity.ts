// src/entities/otp-verification.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('otp_verifications')
@Index(['user', 'type', 'used', 'created_at']) // truy vấn bản ghi mới nhất theo type
export class OtpVerification {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /** LƯU HASH thay vì raw OTP */
  @Column({ type: 'varchar', length: 255, name: 'otp_hash' })
  otp_hash: string;

  @Column({ type: 'timestamp', name: 'expires_at' })
  expires_at: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at: Date;

  @Column({ type: 'boolean', default: false })
  used: boolean;

  /** Thống nhất tên type: 'verify' cho đăng ký/xác minh email, 'reset' cho quên mật khẩu */
  @Column({
    type: 'enum',
    enum: ['verify', 'reset'],
    default: 'verify',
  })
  type: 'verify' | 'reset';
}
