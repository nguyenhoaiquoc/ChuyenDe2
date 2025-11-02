import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Report } from './report.entity';
import { Product } from './product.entity';

@Entity('statuses')
export class Status {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 191 })
  name: string; // VD: 'active', 'blocked', 'inactive'

  @Column({ type: 'varchar', length: 191, nullable: true })
  description: string;

  @OneToMany(() => Report, (report) => report.status)
  reports: Report[];

  @Column({ type: 'timestamp', nullable: true, name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'updated_at' })
  updatedAt: Date;

   
}
