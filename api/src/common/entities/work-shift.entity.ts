import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  Check,
  ManyToOne,
} from 'typeorm';
import { OeeEntity } from './oee.entity';

export enum DayOfWeek {
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
  Saturday = 'Saturday',
  Sunday = 'Sunday',
}

@Entity('work_shifts')
@Unique(['dayOfWeek', 'shiftNumber', 'oeeId', 'isDayActive', 'isShiftActive'])
@Check(`shift_number BETWEEN 1 AND 3`)
export class WorkShiftEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: DayOfWeek,
    name: 'day_of_week',
  })
  dayOfWeek: DayOfWeek;

  @Column({
    type: 'tinyint',
    name: 'shift_number',
  })
  shiftNumber: number;

  @Column({
    type: 'varchar',
    name: 'shift_name',
    length: 100,
  })
  shiftName: string;

  @Column({
    type: 'time',
    name: 'start_time',
  })
  startTime: string;

  @Column({
    type: 'time',
    name: 'end_time',
  })
  endTime: string;

  @Column({
    type: 'boolean',
    name: 'is_day_active',
    default: true,
  })
  isDayActive: boolean; // สถานะการใช้งานในระดับวัน

  @Column({
    type: 'boolean',
    name: 'is_shift_active',
    default: true,
  })
  isShiftActive: boolean; // สถานะการใช้งานในระดับกะ

  @Column({ type: 'int' })
  oeeId: number;

  @ManyToOne(() => OeeEntity, (oee) => oee.workShifts, { onDelete: 'CASCADE' })
  oee: OeeEntity;

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}