import { Machine } from './machine';
import { MachineParameter } from './machine-parameter';
import { OeeBatch } from './oee-batch';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('oeeBatchAs')
export class OeeBatchA {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', default: 0 })
  seconds: number;

  @Column({ type: 'datetime' })
  timestamp: Date;

  @Column({ type: 'int', nullable: true })
  tagId: number;

  @Column({ type: 'int' })
  oeeBatchId: number;

  @ManyToOne(() => OeeBatch, (oeeBatch) => oeeBatch.aParams, { onDelete: 'CASCADE' })
  oeeBatch: OeeBatch;

  @Column({ type: 'int', nullable: true })
  machineId: number;

  @ManyToOne(() => Machine)
  machine: Machine;

  @Column({ type: 'int', nullable: true })
  machineParameterId: number;

  @ManyToOne(() => MachineParameter)
  machineParameter: MachineParameter;

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}
