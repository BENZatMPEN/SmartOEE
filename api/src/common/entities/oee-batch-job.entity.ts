import { OeeBatchEntity } from './oee-batch.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { OeeBatchMcState } from '../type/oee-status';

@Entity('oeeBatchJobs')
export class OeeBatchJobEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  oeeBatchId: number;

  @ManyToOne(() => OeeBatchEntity, { onDelete: 'CASCADE' })
  oeeBatch: OeeBatchEntity;

  @Column({ type: 'datetime', nullable: true })
  batchJobEnded: Date;

  @Column({ type: 'datetime', nullable: true })
  dataJobEnded: Date;

  @Column({ type: 'json', nullable: true })
  mcState: OeeBatchMcState;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
