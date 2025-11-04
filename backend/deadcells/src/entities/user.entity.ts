import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Role } from './role.entity';       // Entity roles
import { Status } from './status.entity';   // Entity statuses
import { Report } from "./report.entity";

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;
  
  
  @Column({ type: 'bigint', name: 'role_id' })
  roleId: number; // 
  
  @Column({ type: 'varchar', length: 191 })
  fullName: string;
  @Column({ type: 'varchar', length: 20, default: 'khong_xac_dinh' })
  gender: string;

  // ✅ BẮT ĐẦU THÊM 4 CỘT BỊ THIẾU:

  @Column({ type: 'text', nullable: true })
  bio: string; // Giới thiệu

  @Column({ type: 'varchar', length: 100, nullable: true })
  nickname: string; // Tên gợi nhớ

  @Column({ type: 'varchar', length: 20, nullable: true })
  citizenId: string; // CCCD / CMND

  @Column({ type: 'date', nullable: true })
  dob: Date; // Ngày sinh


  @Column({ type: 'varchar', length: 191, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 191 })
  password: string;

  @Column({ type: 'varchar', length: 191, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 191, nullable: true })
  image: string | null; // avatar

  @Column({ type: 'varchar', length: 191, nullable: true })
  coverImage: string | null; // ảnh bìa
@Column({ type: 'json', nullable: true })
address_json: object;


@Column({ type: 'tinyint', default: 0 })
gender: number; // 0 = không xác định


  @ManyToOne(() => Status)
  @JoinColumn({ name: 'status_id' })
  status: Status;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'verified_at' })
  verifiedAt: Date | null;
  // ---- Thêm các trường xác thực sinh viên ----
  // @Column({ nullable: true })
  // studentId: string;

  // @Column({ nullable: true })
  // studentName: string;

  // @Column({ nullable: true })
  // faculty: string;

  // @Column({ nullable: true })
  // course: string;
  // @Column({ type: 'boolean', default: false, name: 'is_verified_student' })
  // isVerifiedStudent: boolean;
  // @Column({ nullable: true })
  // schoolName: string;


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

  @OneToMany(() => Report, (report) => report.reporter)
reports: Report[];


  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
