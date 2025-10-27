import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductImage } from './product-image.entity';
import { DealType } from './deal-type.entity';
import { Condition } from './condition.entity';
import { Category } from './category.entity';
import { SubCategory } from './sub-category.entity';
import { Report } from './report.entity';
import { User } from './user.entity';
import { ProductType } from './product_types.entity';
import { PostType } from './post-type.entity';
import { Comment } from './comment.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 191, default: '' })
  name: string;

  @Column({ name: 'product_type_id', type: 'bigint', nullable: true })
  product_type_id: number | null;

  @ManyToOne(() => ProductType, { nullable: true })
  @JoinColumn({ name: 'product_type_id', referencedColumnName: 'id' })
  productType: ProductType | null;

  // ⚙️ Sửa longtext → text (Postgres không có longtext)
  @Column({ type: 'text', nullable: false })
  description: string;

  // ⚙️ decimal Postgres vẫn hỗ trợ, nhưng nên thêm default rõ ràng
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'varchar', length: 191, nullable: true })
  thumbnail_url?: string | null;

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images: ProductImage[];

  // ===== Thông tin người đăng =====
  @Column({ type: 'bigint', nullable: true })
  user_id: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  // ===== Phân loại =====
  @ManyToOne(() => PostType)
  @JoinColumn({ name: 'post_type_id' })
  postType: PostType;

  @Column({ type: 'bigint', nullable: true })
  post_type_id: number | null;

  @Column({ type: 'bigint', nullable: true })
  deal_type_id: number | null;

  @ManyToOne(() => DealType)
  @JoinColumn({ name: 'deal_type_id' })
  dealType: DealType;

  @Column({ type: 'bigint', nullable: true })
  category_id: number | null;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'sub_category_id', type: 'bigint', nullable: true })
  sub_category_id: number | null;

  @ManyToOne(() => SubCategory, (subCategory) => subCategory.products, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sub_category_id' })
  subCategory: SubCategory;

  // ==================== TRAO ĐỔI ====================
  @Column({ type: 'bigint', nullable: true })
  category_change_id: number | null;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_change_id' })
  category_change: Category | null;

  @Column({ type: 'bigint', nullable: true })
  sub_category_change_id: number | null;

  @ManyToOne(() => SubCategory)
  @JoinColumn({ name: 'sub_category_change_id' })
  sub_category_change: SubCategory | null;

  @ManyToOne(() => Condition)
  @JoinColumn({ name: 'condition_id' })
  condition: Condition;

  // ===== Địa chỉ =====
  @Column({ type: 'json', nullable: true })
  address_json: object;

  @OneToMany(() => Report, (report) => report.product)
  reports: Report[];

  @OneToMany(() => Comment, (comment) => comment.product)
  comments: Comment[];
  // ===== Trạng thái bài đăng =====
  @Column({ type: 'bigint', default: 1 })
  status_id: number;

  @Column({ type: 'bigint', default: 0 })
<<<<<<< HEAD
  visibility_type: number;
=======
  visibility_type: number; //0 toàn trường, 1 trong nhóm
>>>>>>> e6bd1a6094cac90d7c947e4d43ee15ecd1f5932c

  @Column({ type: 'bigint', nullable: true })
  group_id: number;

  @Column({ type: 'boolean', default: false })
  is_approved: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
