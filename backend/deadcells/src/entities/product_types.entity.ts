import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity('product_types')
export class ProductType {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @OneToMany(() => Product, (product) => product.productType)
    products: Product[];
}
