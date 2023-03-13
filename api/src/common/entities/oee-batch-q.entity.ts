import { MachineEntity } from './machine.entity';
import { MachineParameterEntity } from './machine-parameter.entity';
import { OeeBatchEntity } from './oee-batch.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('oeeBatchQs')
export class OeeBatchQEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', default: 0 })
  autoAmount: number;

  @Column({ type: 'int', default: 0 })
  manualAmount: number;

  @Column({ type: 'int', nullable: true })
  tagId: number;

  @Column({ type: 'int' })
  oeeBatchId: number;

  @ManyToOne(() => OeeBatchEntity, (oeeBatch) => oeeBatch.qParams, { onDelete: 'CASCADE' })
  oeeBatch: OeeBatchEntity;

  @Column({ type: 'int', nullable: true })
  machineId: number;

  @ManyToOne(() => MachineEntity)
  machine: MachineEntity;

  @Column({ type: 'int', nullable: true })
  machineParameterId: number;

  @ManyToOne(() => MachineParameterEntity)
  machineParameter: MachineParameterEntity;

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}
