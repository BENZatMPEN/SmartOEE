import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { SiteEntity } from './site-entity';
import { RoleSetting } from '../type/role-setting';

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

  @Exclude()
  @Column({ default: false })
  deleted: boolean;

  @Column({ type: 'int' })
  siteId: number;

  @ManyToOne(() => SiteEntity, { onDelete: 'CASCADE' })
  site: SiteEntity;

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}
