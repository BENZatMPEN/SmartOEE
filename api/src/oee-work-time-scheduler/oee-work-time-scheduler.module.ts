import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { OeeWorkTimeEntity } from 'src/common/entities/oee-work-time.entity';
import { OeeEntity } from 'src/common/entities/oee.entity';
import { WorkShiftEntity } from 'src/common/entities/work-shift.entity';
import { OeeWorkTimeSchedulerService } from './oee-work-time-scheduler.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OeeWorkTimeEntity, WorkShiftEntity, OeeEntity]),
    ScheduleModule.forRoot(),
  ],
  providers: [OeeWorkTimeSchedulerService],
  exports: [TypeOrmModule],
})
export class OeeWorkTimeSchedulerModule {}