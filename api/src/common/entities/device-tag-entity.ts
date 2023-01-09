import { DeviceModelTagEntity } from './device-model-tag-entity';
import { DeviceEntity } from './device-entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('deviceTags')
export class DeviceTagEntity {
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

  @ManyToOne(() => DeviceEntity, (device) => device.tags, { onDelete: 'CASCADE' })
  device: DeviceEntity;

  @Column({ type: 'int' })
  deviceModelTagId: number;

  @ManyToOne(() => DeviceModelTagEntity, (deviceModelTag) => deviceModelTag.deviceTags, { onDelete: 'CASCADE' })
  deviceModelTag: DeviceModelTagEntity;

  @Column({ type: 'datetime', nullable: false })
  createdAt: Date;

  @Column({ type: 'datetime', nullable: false })
  updatedAt: Date;
}
