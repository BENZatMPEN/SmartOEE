import { MachineParameter } from './machine-parameter';
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { OeeMachine } from './oee-machine';
import { Widget } from './widget';

@Entity('machines')
export class Machine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  code: string;

  @Column({ type: 'varchar', length: 500 })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  location: string;

  @Column({ type: 'longtext', nullable: true })
  remark: string;

  @Column({ type: 'varchar', length: 4000, nullable: true })
  imageUrl: string;

  @Exclude()
  @Column({ default: false })
  deleted: boolean;

  @Column({ type: 'int' })
  siteId: number;

  @OneToMany(() => MachineParameter, (machineParam) => machineParam.machine)
  parameters: MachineParameter[];

  @ManyToMany(() => Widget)
  @JoinTable({ name: 'machineWidgets' })
  widgets: Widget[];

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;

  @OneToMany(() => OeeMachine, (oeeMachine) => oeeMachine.machine)
  oeeMachines: OeeMachine[];
}
