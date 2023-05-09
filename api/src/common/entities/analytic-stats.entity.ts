import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AnalyticData } from '../type/analytic-data';
import { OeeEntity } from './oee.entity';
import { OeeBatchEntity } from './oee-batch.entity';

@Entity('analyticStats')
export class AnalyticStatsEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'json' })
  data: AnalyticData;

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
