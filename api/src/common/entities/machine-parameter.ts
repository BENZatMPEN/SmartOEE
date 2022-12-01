import { Machine } from './machine';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DeviceTag } from './device-tag';

@Entity('machineParameters')
export class MachineParameter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  oeeType: string;

  @Column({ type: 'int', nullable: true })
  deviceId: number;

  @Column({ type: 'int', nullable: true })
  tagId: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  value: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  barcode: string;

  @ManyToOne(() => DeviceTag, { onDelete: 'SET NULL' })
  tag: DeviceTag;

  @Column({ type: 'int' })
  machineId: number;

  @ManyToOne(() => Machine, (machine) => machine.parameters)
  machine: Machine;

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}
