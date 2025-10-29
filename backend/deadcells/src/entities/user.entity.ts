import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { Status } from './status.entity';
import { Report } from './report.entity';
import { Comment } from './comment.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  /** --------- Quan hệ & FK rõ ràng --------- */
  @ManyToOne(() => Role, { nullable: false })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ type: 'bigint', name: 'role_id' })
  roleId: number;

  @ManyToOne(() => Status, { nullable: false })
  @JoinColumn({ name: 'status_id' })
  status: Status;

  @Column({ type: 'bigint', name: 'status_id' })
  statusId: number;

  /** --------- Hồ sơ cơ bản --------- */
  @Column({ type: 'varchar', length: 191 })
  fullName: string;

  // Khuyến nghị: dùng CITEXT để unique không phân biệt hoa/thường (Postgres cần EXTENSION citext)
  @Column({ type: 'citext', unique: true })
  email: string;

  // Lưu hash, không lưu password thuần
  @Column({ type: 'varchar', length: 191, name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 191, nullable: true })
  image: string; // avatar

  @Column({ type: 'varchar', length: 191, nullable: true })
  coverImage: string; // ảnh bìa

  @Column({ type: 'json', nullable: true })
  address_json: object;

  @Column({ type: 'smallint', default: 0 })
  gender: number; // 0 = không xác định

  @Column({ type: 'timestamp', nullable: true, name: 'last_online_at' })
  lastOnlineAt?: Date | null;


  /** --------- Trạng thái xác minh --------- */
  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'verified_at' })
  verifiedAt: Date | null;

  /** --------- Reset mật khẩu (AN TOÀN) ---------
   *  Lưu HASH của reset token + hạn dùng
   */
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'reset_token_hash',
  })
  resetTokenHash?: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'reset_token_expires_at' })
  resetTokenExpiresAt?: Date | null;

  /** --------- Bảo mật bổ sung ---------
   *  - Thời điểm đổi mật khẩu gần nhất -> dùng để vô hiệu JWT cũ (nếu issuedAt < passwordChangedAt)
   */
  @Column({ type: 'timestamp', nullable: true, name: 'password_changed_at' })
  passwordChangedAt?: Date | null;

  /** --------- Liên kết khác --------- */
  @OneToMany(() => Report, (report) => report.reporter)
  reports: Report[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @Column({ type: 'timestamp', nullable: true, name: 'last_online_at' })
  lastOnlineAt?: Date | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  // Soft delete (tiện cho “deactivate” hoặc xóa mềm tài khoản)
  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;
}
