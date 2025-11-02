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

@Entity('warrantys')
export class Warranty {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  // ✅ Nếu áp dụng cho toàn bộ Category
  @Column({ type: 'bigint', nullable: true })
  category_id: number | null;

  @ManyToOne(() => Category, (category) => category.warrantys, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category | null;

  // ✅ Nếu áp dụng riêng cho 1 SubCategory
  @Column({ type: 'bigint', nullable: true })
  sub_category_id: number | null;

  @ManyToOne(() => SubCategory, (subCategory) => subCategory.warrantys, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sub_category_id' })
  subCategory: SubCategory | null;

  @OneToMany(() => Product, (product) => product.warranty)
  products: Product[];
}
