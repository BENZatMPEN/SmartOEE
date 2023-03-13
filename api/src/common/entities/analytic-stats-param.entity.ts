import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({ type: 'int' })
  @Index()
  productId: number;
}
