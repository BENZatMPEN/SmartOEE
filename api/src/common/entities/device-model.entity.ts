import { DeviceModelTagEntity } from './device-model-tag.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DeviceEntity } from './device.entity';
import { Exclude } from 'class-transformer';

@Entity('deviceModels')
export class DeviceModelEntity {
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
  @OneToMany(() => DeviceEntity, (device) => device.deviceModel)
  devices: DeviceEntity[];

  @OneToMany(() => DeviceModelTagEntity, (tag) => tag.deviceModel)
  tags: DeviceModelTagEntity[];

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}
