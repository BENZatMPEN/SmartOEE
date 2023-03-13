import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SiteEntity } from './site.entity';
import { RoleSetting } from '../type/role-setting';
import { UserEntity } from './user.entity';

@Entity('roles')
export class RoleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'longtext', nullable: true })
  remark: string;

  @Column({ type: 'json', nullable: true })
  roles: RoleSetting[];

  @Column({ type: 'int' })
  siteId: number;

  @ManyToOne(() => SiteEntity, { onDelete: 'CASCADE' })
  site: SiteEntity;

  @ManyToMany(() => UserEntity)
  @JoinTable({ name: 'userRoles' })
  users: UserEntity[];

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}
