import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SiteEntity } from './site-entity';

@Entity('historyLogs')
export class HistoryLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  type: string;

  @Column({ type: 'json', nullable: true })
  data: any;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'int' })
  @ManyToOne(() => SiteEntity)
  siteId: number;

  @Column({ type: 'datetime' })
  createdAt: Date;
}
