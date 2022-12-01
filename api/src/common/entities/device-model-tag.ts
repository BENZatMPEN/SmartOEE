import { DeviceModel } from './device-model';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DeviceTag } from './device-tag';

@Entity('deviceModelTags')
export class DeviceModelTag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  name: string;

  @Column({ type: 'int', default: 0 })
  address: number;

  @Column({ type: 'int', default: 0 })
  length: number;

  @Column({ type: 'varchar', length: 50 })
  dataType: string;

  @Column({ type: 'int', default: 0 })
  readFunc: number;

  @Column({ type: 'int', default: 0 })
  writeFunc: number;

  @Column({ default: false })
  writeState: boolean;

  @Column({ type: 'int', default: 1 })
  factor: number;

  @Column({ type: 'int', default: 0 })
  compensation: number;

  @Column({ type: 'int' })
  deviceModelId: number;

  @ManyToOne(() => DeviceModel, (deviceModel) => deviceModel.tags, { onDelete: 'CASCADE' })
  deviceModel: DeviceModel;

  @OneToMany(() => DeviceTag, (tag) => tag.deviceModelTag)
  deviceTags: DeviceTag[];

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}
