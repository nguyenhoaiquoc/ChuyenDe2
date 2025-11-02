import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Category } from './category.entity';
import { SubCategory } from './sub-category.entity';

@Entity('product_types')
export class ProductType {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string | null;

  @OneToMany(() => Product, (product) => product.productType)
  products: Product[];

  @Column({ type: 'bigint', nullable: true })
  category_id: number | null;

  @ManyToOne(() => Category, (category) => category.productTypes, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category | null;

  // ✅ Nếu áp dụng riêng cho 1 SubCategory
  @Column({ type: 'bigint', nullable: true })
  sub_category_id: number | null;

  @ManyToOne(() => SubCategory, (subCategory) => subCategory.productTypes, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sub_category_id' })
  subCategory: SubCategory | null;
}
