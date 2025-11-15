import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Group } from './group.entity';
import { User } from './user.entity';
import { GroupRole } from './group-role.entity';

@Entity('group_members')
export class GroupMember {
  @PrimaryColumn({ type: 'bigint' })
  group_id: number;

  @PrimaryColumn({ type: 'bigint' })
  user_id: number;

  @Column({ type: 'bigint' })
  group_role_id: number;

  @ManyToOne(() => Group)
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column({ type: 'smallint', default: 3 })
  pending: number;

  @ManyToOne(() => GroupRole)
  @JoinColumn({ name: 'group_role_id' })
  role: GroupRole;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
