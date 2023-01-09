import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user-entity';
import { RoleEntity } from './role-entity';
import { SiteEntity } from './site-entity';

@Entity('userSiteRoles')
export class UserSiteRoleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  userId: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;

  @Column({ type: 'int' })
  roleId: number;

  @ManyToOne(() => RoleEntity, { onDelete: 'CASCADE' })
  role: RoleEntity;

  @Column({ type: 'int' })
  siteId: number;

  @ManyToOne(() => SiteEntity, { onDelete: 'CASCADE' })
  site: SiteEntity;
}
