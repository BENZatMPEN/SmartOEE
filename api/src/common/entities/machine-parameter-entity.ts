import { MachineEntity } from './machine-entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DeviceTagEntity } from './device-tag-entity';

@Entity('machineParameters')
export class MachineParameterEntity {
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

  @ManyToOne(() => DeviceTagEntity, { onDelete: 'SET NULL' })
  tag: DeviceTagEntity;

  @Column({ type: 'int' })
  machineId: number;

  @ManyToOne(() => MachineEntity, (machine) => machine.parameters)
  machine: MachineEntity;

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}
