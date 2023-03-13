import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DeviceTagEntity } from './device-tag.entity';
import { DeviceEntity } from './device.entity';

@Entity('widget')
export class WidgetEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  type: string;

  @Column({ type: 'json', nullable: true })
  data: any;

  @ManyToOne(() => DeviceEntity, { onDelete: 'SET NULL' })
  @Column({ type: 'int', nullable: true })
  deviceId: number;

  @Column({ type: 'int', nullable: true })
  tagId: number;

  @ManyToOne(() => DeviceTagEntity, { onDelete: 'SET NULL' })
  tag: DeviceTagEntity;

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}
