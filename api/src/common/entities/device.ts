import { DeviceModel } from './device-model';
import { DeviceTag } from './device-tag';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Site } from './site';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  name: string;

  @Column({ type: 'longtext', nullable: true })
  remark: string;

  @Column({ type: 'int', default: 0 })
  deviceId: number;

  @Column({ type: 'varchar', length: 500 })
  address: string;

  @Column({ type: 'int', default: 0 })
  port: number;

  @Column({ default: false })
  stopped: boolean;

  @Exclude()
  @Column({ default: false })
  deleted: boolean;

  @Column({ type: 'int' })
  siteId: number;

  @ManyToOne(() => Site, (site) => site.devices)
  site: Site;

  @Column({ type: 'int', nullable: true })
  deviceModelId: number;

  @ManyToOne(() => DeviceModel, (deviceModel) => deviceModel.devices, { onDelete: 'SET NULL' })
  deviceModel: DeviceModel;

  @OneToMany(() => DeviceTag, (tag) => tag.device)
  tags: DeviceTag[];

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}
