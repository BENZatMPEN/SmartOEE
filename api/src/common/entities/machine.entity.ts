import { MachineParameterEntity } from './machine-parameter.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { OeeMachineEntity } from './oee-machine.entity';
import { WidgetEntity } from './widget.entity';

@Entity('machines')
export class MachineEntity {
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
  imageName: string;

  @Exclude()
  @Column({ default: false })
  deleted: boolean;

  @Column({ type: 'int' })
  siteId: number;

  @OneToMany(() => MachineParameterEntity, (machineParam) => machineParam.machine)
  parameters: MachineParameterEntity[];

  @ManyToMany(() => WidgetEntity)
  @JoinTable({ name: 'machineWidgets' })
  widgets: WidgetEntity[];

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;

  @OneToMany(() => OeeMachineEntity, (oeeMachine) => oeeMachine.machine)
  oeeMachines: OeeMachineEntity[];
}
