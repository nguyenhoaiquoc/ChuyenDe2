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

  @OneToMany(() => Brand, (brand) => brand.category)
  brands: Brand[];

  @OneToMany(() => Color, (color) => color.category)
  colors: Color[];

  @OneToMany(() => Capacity, (capacity) => capacity.category)
  capacitys: Capacity[];

  @OneToMany(() => Warranty, (warranty) => warranty.category)
  warrantys: Warranty[];

  @OneToMany(() => Processor, (processor) => processor.category)
  processors: Processor[];

  @OneToMany(() => RamOption, (ramOption) => ramOption.category)
  ramOptions: RamOption[];

  @OneToMany(() => StorageType, (storageType) => storageType.category)
  storageTypes: StorageType[];

  @OneToMany(() => GraphicsCard, (graphicsCard) => graphicsCard.category)
  graphicsCards: GraphicsCard[];

  @OneToMany(() => Breed, (breed) => breed.category)
  breeds: Breed[];

  @OneToMany(() => AgeRange, (ageRange) => ageRange.category)
  ageRanges: AgeRange[];

  @OneToMany(() => Gender, (gender) => gender.category)
  genders: Gender[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
