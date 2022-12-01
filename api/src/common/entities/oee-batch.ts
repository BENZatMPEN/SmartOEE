import { Oee } from './oee';
import { Product } from './product';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OeeBatchA } from './oee-batch-a';
import { OeeBatchQ } from './oee-batch-q';
import { OeeBatchP } from './oee-batch-p';
import { OeeStats } from '../type/oee-stats';
import { Machine } from './machine';
import { initialOeeBatchMcState, OeeBatchMcState } from '../type/oee-status';

@Entity('oeeBatches')
export class OeeBatch {
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

  @Column({ type: 'int', default: 0 })
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
  product: Product;

  @Column({ type: 'json' })
  machines: Machine[];

  @Column({ type: 'varchar', length: 100 })
  status: string;

  @Column({ type: 'int' })
  siteId: number;

  @Column({ type: 'int' })
  oeeId: number;

  @ManyToOne(() => Oee, (oee) => oee.oeeProducts, { onDelete: 'CASCADE' })
  oee: Oee;

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

  @OneToMany(() => OeeBatchA, (oeeBatchA) => oeeBatchA.oeeBatch)
  aParams: OeeBatchA[];

  @OneToMany(() => OeeBatchP, (oeeBatchP) => oeeBatchP.oeeBatch)
  pParams: OeeBatchP[];

  @OneToMany(() => OeeBatchQ, (oeeBatchQ) => oeeBatchQ.oeeBatch)
  qParams: OeeBatchQ[];

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;

  @Column({ type: 'json' })
  mcState: OeeBatchMcState;
}
