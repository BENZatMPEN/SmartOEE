import { DeviceModelEntity } from './device-model.entity';
import { DeviceTagEntity } from './device-tag.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { SiteEntity } from './site.entity';

@Entity('devices')
export class DeviceEntity {
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

  @ManyToOne(() => SiteEntity, (site) => site.devices)
  site: SiteEntity;

  @Column({ type: 'int', nullable: true })
  deviceModelId: number;

  @ManyToOne(() => DeviceModelEntity, (deviceModel) => deviceModel.devices, { onDelete: 'SET NULL' })
  deviceModel: DeviceModelEntity;

  @OneToMany(() => DeviceTagEntity, (tag) => tag.device)
  tags: DeviceTagEntity[];

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}
