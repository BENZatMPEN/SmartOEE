import { OeeBatch } from './oee-batch';
import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('oeeBatchLogs')
export class OeeBatchLog {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'json' })
  data: any;

  @Column({ type: 'datetime' })
  @Index()
  timestamp: Date;

  @Column({ type: 'int' })
  oeeId: number;

  @Column({ type: 'int' })
  productId: number;

  @Column({ type: 'int' })
  @Index()
  oeeBatchId: number;

  @ManyToOne(() => OeeBatch, { onDelete: 'CASCADE' })
  oeeBatch: OeeBatch;

  @Column({ type: 'datetime' })
  createdAt: Date;
}
