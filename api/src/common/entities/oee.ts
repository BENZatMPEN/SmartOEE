import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OeeMachine } from './oee-machine';
import { OeeProduct } from './oee-product';
import { Exclude } from 'class-transformer';
import { PercentSetting } from '../type/percent-settings';
import { OeeTag } from '../type/oee-tag';

@Entity('oees')
export class Oee {
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
  imageUrl: string;

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

  @OneToMany(() => OeeProduct, (oeeProduct) => oeeProduct.oee)
  oeeProducts: OeeProduct[];

  @OneToMany(() => OeeMachine, (oeeMachine) => oeeMachine.oee)
  oeeMachines: OeeMachine[];

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
}
