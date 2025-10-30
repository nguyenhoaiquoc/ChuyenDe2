import { Product } from './product.entity'; // 👈 thêm dòng này
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'; // 👈 đã có nhưng nhắc lại cho chắc
import { SubCategory } from './sub-category.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 191 })
  name: string;

  @OneToMany(() => SubCategory, (subCategory) => subCategory.category)
  subCategories: SubCategory[]; 

  @Column({ type: 'varchar', length: 191, nullable: true })
  image: string;

  @Column({ type: 'boolean', default: false })
  hot: boolean;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
    productTypes: any;
}
