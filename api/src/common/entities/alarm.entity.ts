import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { SiteEntity } from './site.entity';
import { AlarmCondition } from '../type/alarm';

@Entity('alarms')
export class AlarmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  type: string;

  @Column({ type: 'varchar', length: 500 })
  name: string;

  @Column({ default: true })
  notify: boolean;

  @Column({ type: 'json', nullable: true })
  data: any;

  @Column({ type: 'json' })
  condition: AlarmCondition;

  @Exclude()
  @Column({ default: false })
  deleted: boolean;

  @Column({ type: 'int' })
  @ManyToOne(() => SiteEntity)
  siteId: number;

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}
