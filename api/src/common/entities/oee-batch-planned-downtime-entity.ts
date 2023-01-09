import { OeeBatchEntity } from './oee-batch-entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('oeeBatchPlannedDowntimes')
export class OeeBatchPlannedDowntimeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'varchar', length: 50 })
  timing: string;

  @Column({ type: 'int' })
  seconds: number;

  @Column({ type: 'datetime', nullable: true })
  toBeExpired: Date;

  @Column({ type: 'datetime', nullable: true })
  expiredAt: Date;

  @Column({ type: 'int' })
  oeeBatchId: number;

  @ManyToOne(() => OeeBatchEntity, { onDelete: 'CASCADE' })
  oeeBatch: OeeBatchEntity;

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}
