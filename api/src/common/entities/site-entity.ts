import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserEntity } from './user-entity';
import { DeviceEntity } from './device-entity';
import { PercentSetting } from '../type/percent-settings';

@Entity('sites')
export class SiteEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  branch: string;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  address: string;

  @Column({ type: 'longtext', nullable: true })
  remark: string;

  @Column({ type: 'varchar', length: 4000, nullable: true })
  imageName: string;

  @Column({ type: 'double precision', default: 0 })
  lat: number;

  @Column({ type: 'double precision', default: 0 })
  lng: number;

  @Column({ default: false })
  sync: boolean;

  @Exclude()
  @Column({ default: false })
  deleted: boolean;

  @Column({ default: true })
  active: boolean;

  @OneToMany(() => DeviceEntity, (device) => device.site)
  devices: DeviceEntity[];

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;

  @Exclude()
  @ManyToMany(() => UserEntity)
  @JoinTable({ name: 'userSites' })
  users: UserEntity[];

  @Column({ type: 'json' })
  defaultPercentSettings: PercentSetting[];

  @Column({ type: 'datetime', nullable: true })
  cutoffTime: Date;

  @Column({ type: 'int', default: -1 })
  oeeLimit: number;

  @Column({ type: 'int', default: -1 })
  userLimit: number;

  // @OneToMany(() => Role, (role) => role.site)
  // roles: Role[];
  //
  // @OneToMany(() => UserSiteRole, (userSite) => userSite.user)
  // userSites: UserSiteRole[];
}
