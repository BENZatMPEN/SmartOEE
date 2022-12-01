import { DeviceModelTag } from './device-model-tag';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Device } from './device';
import { Exclude } from 'class-transformer';

@Entity('deviceModels')
export class DeviceModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  name: string;

  @Column({ type: 'longtext', nullable: true })
  remark: string;

  @Column({ type: 'varchar', length: 100 })
  modelType: string;

  @Column({ type: 'varchar', length: 100 })
  connectionType: string;

  @Exclude()
  @Column({ default: false })
  deleted: boolean;

  @Column({ type: 'int' })
  siteId: number;

  // @HasMany(() => Device, {
  //   foreignKey: {
  //     allowNull: true,
  //   },
  // })
  @OneToMany(() => Device, (device) => device.deviceModel)
  devices: Device[];

  @OneToMany(() => DeviceModelTag, (tag) => tag.deviceModel)
  tags: DeviceModelTag[];

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}
