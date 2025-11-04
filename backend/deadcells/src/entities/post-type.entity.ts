import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Product } from "./product.entity";

@Entity("post_types")
export class PostType {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number;

  @Column({ type: "varchar", length: 100 })
  name: string; // ví dụ: "Đăng bán" / "Đăng mua"

  @OneToMany(() => Product, (product) => product.postType)
  products: Product[];
}
