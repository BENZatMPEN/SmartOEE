import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SiteEntity } from './site.entity';
import { AnalyticCriteria } from '../type/analytic-criteria';

@Entity('analytics')
export class AnalyticEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  name: string;

  @Column({ type: 'json' })
  data: AnalyticCriteria;

  @Column({ default: false })
  group: boolean;

  @Column({ type: 'int' })
  @ManyToOne(() => SiteEntity)
  siteId: number;

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}
