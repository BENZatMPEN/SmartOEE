import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { OeeBatchEntity } from './oee-batch.entity';

@Entity('oeeBatchNotifications')
export class OeeBatchNotificationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Index()
  @Column({ type: 'int' })
  @ManyToOne(() => OeeBatchEntity, { onDelete: 'CASCADE' })
  batchId: number;

  @Column({ default: false })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
