import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DeviceTag } from './device-tag';
import { Device } from './device';

@Entity('widget')
export class Widget {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  type: string;

  @Column({ type: 'json', nullable: true })
  data: any;

  @ManyToOne(() => Device, { onDelete: 'SET NULL' })
  @Column({ type: 'int', nullable: true })
  deviceId: number;

  @Column({ type: 'int', nullable: true })
  tagId: number;

  @ManyToOne(() => DeviceTag, { onDelete: 'SET NULL' })
  tag: DeviceTag;

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}
