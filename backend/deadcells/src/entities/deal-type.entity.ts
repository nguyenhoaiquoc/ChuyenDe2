import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Product } from "./product.entity";

@Entity("deal_types")
export class DealType {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number;

  @Column({ type: "varchar", length: 100 })
  name: string; // ví dụ: "Giá bán", "Miễn phí", "Trao đổi"

  @OneToMany(() => Product, (product) => product.dealType)
  products: Product[];
}
