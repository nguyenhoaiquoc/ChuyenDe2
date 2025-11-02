import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Product } from "./product.entity";

@Entity("conditions")
export class Condition {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number;

  @Column({ type: "varchar", length: 100 })
  name: string; // ví dụ: "Mới", "Đã sử dụng", "Cũ"

  @OneToMany(() => Product, (product) => product.condition)
  products: Product[];
}
