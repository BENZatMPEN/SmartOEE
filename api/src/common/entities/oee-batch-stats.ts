import { OeeBatch } from './oee-batch';
import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OeeStats } from '../type/oee-stats';

@Entity('oeeBatchStats')
@Index(['oeeId', 'productId', 'oeeBatchId', 'timestamp'])
export class OeeBatchStats {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'json' })
  data: OeeStats;

  @Column({ type: 'datetime' })
  @Index()
  timestamp: Date;

  @Column({ type: 'int' })
  @Index()
  oeeId: number;

  @Column({ type: 'int' })
  @Index()
  oeeBatchId: number;

  @Column({ type: 'int' })
  @Index()
  productId: number;

  @ManyToOne(() => OeeBatch, { onDelete: 'CASCADE' })
  oeeBatch: OeeBatch;
}
