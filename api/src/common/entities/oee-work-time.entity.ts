import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OeeEntity } from './oee.entity';

@Entity('oeeWorkTimes')
@Unique(['oeeId', 'startDateTime'])
export class OeeWorkTimeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  oeeId: number;

  @ManyToOne(() => OeeEntity, (oee) => oee.workTimes, { onDelete: 'CASCADE' })
  oee: OeeEntity;

  @Column({ type: 'datetime' })
  startDateTime: Date;  // วันที่และเวลาที่เริ่มทำงาน

  @Column({ type: 'datetime' })
  endDateTime: Date;    // วันที่และเวลาที่สิ้นสุดการทำงาน

  @Column({ type: 'int', default: 0 })
  totalHours: number;

  @Column({ type: 'int', default: 0 })
  totalMinutes: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}