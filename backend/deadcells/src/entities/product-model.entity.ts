import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Brand } from './brand.entity';

@Entity('product_models') // Tên bảng là 'product_models'
export class ProductModel {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  // ✅ Liên kết ngược về Hãng (Brand)
  @Column({ type: 'bigint' })
  brand_id: number;

  @ManyToOne(() => Brand, (brand) => brand.productModels, {
    nullable: false, // Bắt buộc phải có hãng
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @OneToMany(() => Product, (product) => product.productModel)
  products: Product[];
}