import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Site } from './site';
import { AnalyticCriteria } from '../type/analytic-criteria';

@Entity('analytics')
export class Analytic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  name: string;

  @Column({ type: 'json' })
  data: AnalyticCriteria;

  @Column({ default: false })
  group: boolean;

  @Column({ type: 'int' })
  @ManyToOne(() => Site)
  siteId: number;

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}
