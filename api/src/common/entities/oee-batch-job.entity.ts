import { OeeBatchEntity } from './oee-batch.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OeeBatchMcState } from '../type/oee-status';

@Entity('oeeBatchJobs')
export class OeeBatchJobEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  oeeBatchId: number;

  @ManyToOne(() => OeeBatchEntity, (oeeBatch) => oeeBatch.aParams, { onDelete: 'CASCADE' })
  oeeBatch: OeeBatchEntity;

  @Column({ type: 'datetime', nullable: true })
  batchJobEnded: Date;

  @Column({ type: 'datetime', nullable: true })
  dataJobEnded: Date;

  @Column({ type: 'json', nullable: true })
  mcState: OeeBatchMcState;

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}
