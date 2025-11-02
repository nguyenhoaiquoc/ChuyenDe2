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

@Entity('engine_capacities')
export class EngineCapacity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'bigint', nullable: true })
  category_id: number | null;

  @ManyToOne(() => Category, (category) => category.engineCapacities, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category | null;

  @Column({ type: 'bigint', nullable: true })
  sub_category_id: number | null;

  @ManyToOne(() => SubCategory, (subCategory) => subCategory.engineCapacities, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sub_category_id' })
  subCategory: SubCategory | null;

  @OneToMany(() => Product, (product) => product.engineCapacity)
  products: Product[];
}