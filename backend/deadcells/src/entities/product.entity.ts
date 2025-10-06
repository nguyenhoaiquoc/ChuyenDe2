import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 191 })
  name: string;

  @Column({ type: 'bigint' })
  user_id: number;

  @Column({ type: 'bigint' })
  post_type_id: number;

  @Column({ type: 'bigint' })
  deal_type_id: number;

  @Column({ type: 'bigint' })
  category_id: number;

  @Column({ type: 'bigint', nullable: true })
  categoryChange_id: number;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'longtext' })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'bigint' })
  condition_id: number;
  
@Column({ type: 'json', nullable: true })
address_json: object;


  @Column({ type: 'bigint' })
  status_id: number;

  @Column({ type: 'bigint', default: 0 })
  visibility_type: number;

  @Column({ type: 'bigint', nullable: true })
  group_id: number;

  @Column({ type: 'boolean' })
  is_approved: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
