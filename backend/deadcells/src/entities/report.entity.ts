
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { Product } from "./product.entity";
import { User } from "./user.entity";
import { Status } from "./status.entity";

@Entity({ name: "reports" })
export class Report {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @ManyToOne(() => Product, (product) => product.reports, { onDelete: "CASCADE" })
  @JoinColumn({ name: "product_id" })
  product: Product;

  @ManyToOne(() => User, (user) => user.reports, { onDelete: "CASCADE" })
  @JoinColumn({ name: "reporter_id" })
  reporter: User;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "reported_user_id" })
  reported_user: User; // <-- Quan hệ với "người bị báo cáo"

  @Column({ type: "varchar", length: 191, nullable: true })
  reason: string;

  @ManyToOne(() => Status, (status) => status.reports)
  @JoinColumn({ name: "status_id" })
  status: Status;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}