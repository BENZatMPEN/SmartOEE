import { MachineEntity } from './machine.entity';
import { OeeMachinePlannedDowntimeEntity } from './oee-machine-planned-downtime.entity';
import { OeeEntity } from './oee.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('oeeMachines')
export class OeeMachineEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  oeeId: number;

  @ManyToOne(() => OeeEntity, (oee) => oee.oeeMachines, { onDelete: 'CASCADE' })
  oee: OeeEntity;

  @Column({ type: 'int' })
  machineId: number;

  @ManyToOne(() => MachineEntity, (machine) => machine.oeeMachines, { onDelete: 'CASCADE' })
  machine: MachineEntity;

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;

  @OneToMany(() => OeeMachinePlannedDowntimeEntity, (oeeMachinePlannedDowntime) => oeeMachinePlannedDowntime.oeeMachine, { onDelete: 'CASCADE' })
  oeeMachinePlannedDowntime: OeeMachinePlannedDowntimeEntity[];
}
