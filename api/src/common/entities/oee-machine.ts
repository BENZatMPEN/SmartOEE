import { Machine } from './machine';
import { Oee } from './oee';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('oeeMachines')
export class OeeMachine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  oeeId: number;

  @ManyToOne(() => Oee, (oee) => oee.oeeMachines, { onDelete: 'CASCADE' })
  oee: Oee;

  @Column({ type: 'int' })
  machineId: number;

  @ManyToOne(() => Machine, (machine) => machine.oeeMachines, { onDelete: 'CASCADE' })
  machine: Machine;

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}
