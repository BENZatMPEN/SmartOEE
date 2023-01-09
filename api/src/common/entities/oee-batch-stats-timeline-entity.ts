import { OeeBatchEntity } from './oee-batch-entity';
import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('oeeBatchStatsTimelines')
export class OeeBatchStatsTimelineEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @Column({ type: 'datetime' })
  fromDate: Date;

  @Column({ type: 'datetime' })
  toDate: Date;

  @Column({ type: 'int' })
  @Index()
  oeeId: number;

  @Column({ type: 'int' })
  @Index()
  productId: number;

  @Column({ type: 'int' })
  @Index()
  oeeBatchId: number;

  @ManyToOne(() => OeeBatchEntity, { onDelete: 'CASCADE' })
  oeeBatch: OeeBatchEntity;
}
