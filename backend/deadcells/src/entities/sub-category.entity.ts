import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'; // ✅ nhớ import
import { Category } from './category.entity';
import { Product } from './product.entity';
import { ProductType } from './product_types.entity';

@Entity('sub_categories')
export class SubCategory {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 191 })
  name: string;

  @Column()
  category_id: number;
  @OneToMany(() => ProductType, (productType) => productType.subCategory)
  productTypes: ProductType[];

  @ManyToOne(() => Category, (category) => category.subCategories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'bigint' })
  parent_category_id: number;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'parent_category_id' })
  parentCategory: Category;

  @Column({ type: 'varchar', length: 191, nullable: true })
  source_table: string | null;

  @Column({ type: 'bigint', nullable: true })
  source_id: number | null;

  @OneToMany(() => Product, (product) => product.subCategory)
  products: Product[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
