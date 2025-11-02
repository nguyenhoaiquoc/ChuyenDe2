import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 191 })
  name: string; // VD: 'admin', 'user', 'moderator'

  @Column({ type: 'varchar', length: 191, nullable: true })
  description: string;

  @Column({ type: 'timestamp', nullable: true, name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'updated_at' })
  updatedAt: Date;
}
