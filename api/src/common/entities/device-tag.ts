import { DeviceModelTag } from './device-model-tag';
import { Device } from './device';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('deviceTags')
export class DeviceTag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  name: string;

  @Column({ type: 'int', default: 0 })
  spLow: number;

  @Column({ type: 'int', default: 0 })
  spHigh: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  updateInterval: string;

  @Column({ default: false })
  record: boolean;

  @Column({ type: 'int' })
  deviceId: number;

  @ManyToOne(() => Device, (device) => device.tags, { onDelete: 'CASCADE' })
  device: Device;

  @Column({ type: 'int' })
  deviceModelTagId: number;

  @ManyToOne(() => DeviceModelTag, (deviceModelTag) => deviceModelTag.deviceTags, { onDelete: 'CASCADE' })
  deviceModelTag: DeviceModelTag;

  @Column({ type: 'datetime', nullable: false })
  createdAt: Date;

  @Column({ type: 'datetime', nullable: false })
  updatedAt: Date;
}
