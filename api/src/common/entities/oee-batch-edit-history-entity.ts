import { OeeBatchEntity } from './oee-batch-entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('oeeBatchHistories')
export class OeeBatchEditHistoryEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  type: string;

  @Column({ type: 'json' })
  data: any;

  @Column({ type: 'int' })
  oeeBatchId: number;

  @ManyToOne(() => OeeBatchEntity, { onDelete: 'CASCADE' })
  oeeBatch: OeeBatchEntity;

  @Column({ type: 'datetime' })
  createdAt: Date;
}
