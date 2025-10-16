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
import { ProductType } from './product_types.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 191, nullable: true, default: '' })
  author_name: string;

  @Column({ type: 'varchar', length: 191, default: '' })
  name: string;

  @ManyToOne(() => ProductType)
  @JoinColumn({ name: 'product_type_id' })
  productType: ProductType;

  @Column({ type: 'bigint', nullable: true })
  product_type_id: number | null;


  @Column({ type: 'longtext', nullable: false })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'varchar', length: 191, nullable: true })
  thumbnail_url: string;

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images: ProductImage[];

  // ===== Thông tin người đăng =====
  @Column({ type: 'bigint' })
  user_id: number;

  // ===== Phân loại =====
  @Column({ type: 'bigint', nullable: true })
  post_type_id: number;

  @Column({ type: 'bigint', nullable: true })
  deal_type_id: number | null;

  @ManyToOne(() => DealType)
  @JoinColumn({ name: "deal_type_id" })
  dealType: DealType;

  @Column({ type: 'bigint', nullable: true })
  category_id: number;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'sub_category_id', type: 'bigint', nullable: true })
  sub_category_id: number | null;

  @ManyToOne(() => SubCategory, (subCategory) => subCategory.products, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sub_category_id' })
  subCategory: SubCategory;

  // ==================== TRAO ĐỔI ====================
  // Danh mục cha người dùng muốn trao đổi
  @Column({ type: 'bigint', nullable: true })
  categoryChange_id: number | null;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryChange_id' })
  categoryChange: Category | null;

  // Danh mục con người dùng muốn trao đổi
  @Column({ type: 'bigint', nullable: true })
  subCategoryChange_id: number | null;

  @ManyToOne(() => SubCategory)
  @JoinColumn({ name: 'subCategoryChange_id' })
  subCategoryChange: SubCategory | null;

  @ManyToOne(() => Condition)
  @JoinColumn({ name: "condition_id" })
  condition: Condition;

  // ===== Địa chỉ =====
  @Column({ type: 'json', nullable: true })
  address_json: object;
  
  @OneToMany(() => Report, (report) => report.product)
  reports: Report[];

  // ===== Trạng thái bài đăng =====
  @Column({ type: 'bigint', default: 1 })
  status_id: number;

  @Column({ type: 'bigint', default: 0 })
  visibility_type: number;

  @Column({ type: 'bigint', nullable: true })
  group_id: number;

  @Column({ type: 'boolean', default: false })
  is_approved: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}