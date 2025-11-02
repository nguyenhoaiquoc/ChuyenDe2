import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'; // ✅ nhớ import
import { Category } from './category.entity';
import { Product } from './product.entity';
import { ProductType } from './product_types.entity';
import { Origin } from './origin.entity';
import { Material } from './material.entity';
import { Size } from './size.entity';
import { Brand } from './brand.entity';
import { Color } from './color.entity';
import { Warranty } from './warranty.entity';
import { Capacity } from './capacity.entity';
import { Processor } from './processor.entity';
import { RamOption } from './ram-option.entity';
import { GraphicsCard } from './graphics-card.entity';
import { StorageType } from './storage-type.entity';
import { Breed } from './breed.entity';
import { AgeRange } from './age-range.entity';
import { Gender } from './gender.entity';
import { EngineCapacity } from './engine-capacity.entity';

@Entity('sub_categories')
export class SubCategory {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 191 })
  name: string;

  @Column()
  category_id: number;

  @ManyToOne(() => Category, (category) => category.subCategories, {
    onDelete: 'CASCADE',
  })
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

  @OneToMany(() => ProductType, (productType) => productType.subCategory)
  productTypes: ProductType[];

  @OneToMany(() => Origin, (origin) => origin.subCategory)
  origins: Origin[];

  @OneToMany(() => Material, (material) => material.subCategory)
  materials: Origin[];

  @OneToMany(() => Size, (size) => size.subCategory)
  sizes: Size[];

  @OneToMany(() => Brand, (brand) => brand.subCategory)
  brands: Brand[];

  @OneToMany(() => Color, (color) => color.subCategory)
  colors: Color[];

  @OneToMany(() => Capacity, (capacity) => capacity.subCategory)
  capacitys: Capacity[];

  @OneToMany(() => Warranty, (warranty) => warranty.subCategory)
  warrantys: Warranty[];

  @OneToMany(() => Processor, (processor) => processor.subCategory)
  processors: Processor[];

  @OneToMany(() => RamOption, (ramOption) => ramOption.subCategory)
  ramOptions: RamOption[];

  @OneToMany(() => StorageType, (storageType) => storageType.subCategory)
  storageTypes: StorageType[];

  @OneToMany(() => GraphicsCard, (graphicsCard) => graphicsCard.subCategory)
  graphicsCards: GraphicsCard[];

  @OneToMany(() => Breed, (breed) => breed.subCategory)
  breeds: Breed[];

  @OneToMany(() => AgeRange, (ageRange) => ageRange.subCategory)
  ageRanges: AgeRange[];

  @OneToMany(() => Gender, (gender) => gender.subCategory)
  genders: Gender[];

  @OneToMany(() => EngineCapacity, (engineCapacitie) => engineCapacitie.subCategory)
  engineCapacities: EngineCapacity[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
