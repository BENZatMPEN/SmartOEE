import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OeeMachineEntity } from './oee-machine.entity';
import { OeeProductEntity } from './oee-product.entity';
import { Exclude } from 'class-transformer';
import { PercentSetting } from '../type/percent-settings';
import { OeeTag } from '../type/oee-tag';

@Entity('oees')
export class OeeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  oeeCode: string;

  @Column({ type: 'varchar', length: 100 })
  oeeType: string;

  @Column({ type: 'varchar', length: 500 })
  location: string;

  @Column({ type: 'varchar', length: 500 })
  productionName: string;

  @Column({ type: 'longtext', nullable: true })
  remark: string;

  @Column({ type: 'varchar', length: 4000, nullable: true })
  imageName: string;

  @Exclude()
  @Column({ default: false })
  deleted: boolean;

  @Column({ type: 'double precision', default: 0 })
  minorStopSeconds: number;

  @Column({ type: 'double precision', default: 0 })
  breakdownSeconds: number;

  @Column({ type: 'int' })
  siteId: number;

  @Column({ type: 'json', nullable: true })
  tags: OeeTag[];

  @OneToMany(() => OeeProductEntity, (oeeProduct) => oeeProduct.oee)
  oeeProducts: OeeProductEntity[];

  @OneToMany(() => OeeMachineEntity, (oeeMachine) => oeeMachine.oee)
  oeeMachines: OeeMachineEntity[];

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;

  @Column({ default: true })
  useSitePercentSettings: boolean;

  @Column({ type: 'json', nullable: true })
  percentSettings: PercentSetting[];

  @Column({ type: 'varchar', length: 100 })
  timeUnit: string;

  @Column({ type: 'boolean', default: false })
  activePcs: boolean;

  @Column({ type: 'int', nullable: true })
  pscGram: number;
}
