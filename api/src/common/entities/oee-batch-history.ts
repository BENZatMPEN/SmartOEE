import { OeeBatch } from './oee-batch';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('oeeBatchHistories')
export class OeeBatchHistory {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  type: string;

  @Column({ type: 'json' })
  data: any;

  @Column({ type: 'int' })
  oeeBatchId: number;

  @ManyToOne(() => OeeBatch, { onDelete: 'CASCADE' })
  oeeBatch: OeeBatch;

  @Column({ type: 'datetime' })
  createdAt: Date;
}
