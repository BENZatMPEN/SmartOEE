import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Site } from './site';

@Entity('historyLogs')
export class HistoryLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  type: string;

  @Column({ type: 'json', nullable: true })
  data: any;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'int' })
  @ManyToOne(() => Site)
  siteId: number;

  @Column({ type: 'datetime' })
  createdAt: Date;
}
