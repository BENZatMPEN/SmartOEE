import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { AnalyticData } from '../type/analytic-data';

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

  @Column({ type: 'int' })
  @Index()
  productId: number;
}
