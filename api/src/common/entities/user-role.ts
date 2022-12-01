import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user';
import { Role } from './role';
import { Site } from './site';

@Entity('userRoles')
export class UserRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'int' })
  roleId: number;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  role: Role;

  @Column({ type: 'int' })
  siteId: number;

  @ManyToOne(() => Site, { onDelete: 'CASCADE' })
  site: Site;
}
