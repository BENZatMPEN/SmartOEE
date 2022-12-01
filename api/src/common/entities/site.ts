import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from './user';
import { DeviceTag } from './device-tag';
import { Device } from './device';
import { PercentSetting } from '../type/percent-settings';

@Entity('sites')
export class Site {
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
  imageUrl: string;

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

  @OneToMany(() => Device, (device) => device.site)
  devices: Device[];

  @Column({ type: 'datetime', nullable: false })
  createdAt: Date;

  @Column({ type: 'datetime', nullable: false })
  updatedAt: Date;

  @Exclude()
  @ManyToMany(() => User)
  @JoinTable({ name: 'userSites' })
  users: User[];

  @Column({ type: 'json' })
  defaultPercentSettings: PercentSetting[];

  @Column({ type: 'datetime', nullable: true })
  cutoffTime: Date;

  // @OneToMany(() => Role, (role) => role.site)
  // roles: Role[];
  //
  // @OneToMany(() => UserSiteRole, (userSite) => userSite.user)
  // userSites: UserSiteRole[];
}
