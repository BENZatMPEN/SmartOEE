import { OeeEntity } from './oee-entity';
import { ProductEntity } from './product-entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OeeBatchAEntity } from './oee-batch-a-entity';
import { OeeBatchQEntity } from './oee-batch-q-entity';
import { OeeBatchPEntity } from './oee-batch-p-entity';
import { OeeStats } from '../type/oee-stats';
import { MachineEntity } from './machine-entity';
import { OeeBatchMcState } from '../type/oee-status';
import { PlanningEntity } from './planning-entity';

@Entity('oeeBatches')
export class OeeBatchEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'datetime' })
  startDate: Date;

  @Column({ type: 'datetime' })
  endDate: Date;

  @Column({ type: 'datetime', nullable: true })
  batchStartedDate: Date;

  @Column({ type: 'datetime', nullable: true })
  batchStoppedDate: Date;

  @Column({ default: false })
  toBeStopped: boolean;

  @Column({ type: 'int', default: 0 })
  minorStopSeconds: number;

  @Column({ type: 'int', default: 0 })
  breakdownSeconds: number;

  @Column({ type: 'double precision', default: 0 })
  standardSpeedSeconds: number;

  @Column({ type: 'int', default: 0 })
  plannedQuantity: number;

  @Column({ type: 'int', default: 0 })
  targetQuantity: number;

  @Column({ type: 'varchar', length: 2000, default: '' })
  lotNumber: string;

  @Column({ type: 'json' })
  oeeStats: OeeStats;

  @Column({ type: 'json' })
  product: ProductEntity;

  @Column({ type: 'json' })
  machines: MachineEntity[];

  @Column({ type: 'varchar', length: 100 })
  status: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  userEmail: string;

  @Column({ type: 'int' })
  siteId: number;

  @Column({ type: 'int', nullable: true })
  planningId: number;

  @ManyToOne(() => PlanningEntity, { onDelete: 'SET NULL' })
  planning: PlanningEntity;

  @Column({ type: 'int' })
  oeeId: number;

  @ManyToOne(() => OeeEntity, (oee) => oee.oeeProducts, { onDelete: 'CASCADE' })
  oee: OeeEntity;

  // @ForeignKey(() => Product)
  // @Column({ type: 'int' })
  // productId: number;

  // @BelongsTo(() => Product)
  // @ManyToOne(() => Product)
  // product: Product;

  // @HasMany(() => OeeBatchPlannedDowntime)
  // plannedDowntimes: OeeBatchPlannedDowntime[];

  // // @HasMany(() => OeeBatchChangeEntity)
  // changes: OeeBatchChange[];

  @OneToMany(() => OeeBatchAEntity, (oeeBatchA) => oeeBatchA.oeeBatch)
  aParams: OeeBatchAEntity[];

  @OneToMany(() => OeeBatchPEntity, (oeeBatchP) => oeeBatchP.oeeBatch)
  pParams: OeeBatchPEntity[];

  @OneToMany(() => OeeBatchQEntity, (oeeBatchQ) => oeeBatchQ.oeeBatch)
  qParams: OeeBatchQEntity[];

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;

  @Column({ type: 'json' })
  mcState: OeeBatchMcState;
}
