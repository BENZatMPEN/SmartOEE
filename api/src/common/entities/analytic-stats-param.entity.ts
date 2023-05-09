import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OeeBatchEntity } from './oee-batch.entity';

@Entity('analyticStatsParams')
export class AnalyticStatsParamEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'json' })
  data: any;

  @Column({ type: 'varchar', length: 10 })
  @Index()
  paramType: string;

  @Column({ type: 'datetime' })
  @Index()
  timestamp: Date;

  @Column({ type: 'int' })
  @Index()
  siteId: number;

  @Column({ type: 'int' })
  @Index()
  oeeId: number;

  @Column({ type: 'int' })
  @Index()
  oeeBatchId: number;

  @ManyToOne(() => OeeBatchEntity, { onDelete: 'CASCADE' })
  oeeBatch: OeeBatchEntity;

  @Column({ type: 'int' })
  @Index()
  productId: number;
}
