import { Product } from './product.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SubCategory } from './sub-category.entity';
import { ProductType } from './product_types.entity';
import { Origin } from './origin.entity';
import { Material } from './material.entity';
import { Size } from './size.entity';

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

  @OneToMany(() => ProductType, (productType) => productType.category)
  productTypes: ProductType[];

  @OneToMany(() => Origin, (origin) => origin.category)
  origins: Origin[];

  @OneToMany(() => Material, (material) => material.category)
  materials: Material[];

  @OneToMany(() => Size, (size) => size.category)
  sizes: Size[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
