import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OeeWorkTimeEntity } from 'src/common/entities/oee-work-time.entity';
import { OeeEntity } from 'src/common/entities/oee.entity';
import { WorkShiftEntity, DayOfWeek } from 'src/common/entities/work-shift.entity';
// import dayjs from 'dayjs';
import * as dayjs from 'dayjs';

@Injectable()
export class OeeWorkTimeSchedulerService {
  private readonly logger = new Logger(OeeWorkTimeSchedulerService.name);

  constructor(
    @InjectRepository(OeeWorkTimeEntity)
    private readonly workTimeRepository: Repository<OeeWorkTimeEntity>,

    @InjectRepository(WorkShiftEntity)
    private readonly workShiftRepository: Repository<WorkShiftEntity>,

    @InjectRepository(OeeEntity)
    private readonly oeeRepository: Repository<OeeEntity>,
  ) { }

  /**
   * Scheduled Task that runs daily at 00:10 to pre-schedule work time for the day.
   */
  @Cron('10 0 * * *', {
    name: 'preScheduleWorkTime',
    timeZone: 'Asia/Bangkok',
  })
  async handlePreScheduleWorkTime() {
    this.logger.debug('Starting pre-scheduling work time for today.');

    try {
      const today = dayjs();
      const dayOfWeek = DayOfWeek[today.format('dddd') as keyof typeof DayOfWeek];

      // ดึงกะที่ใช้งานอยู่ในวันนี้
      const workShifts = await this.workShiftRepository.find({
        where: {
          dayOfWeek,
          isDayActive: true,
          isShiftActive: true,
        },
        relations: ['oee'],
      });

      for (const shift of workShifts) {
        const workStart = today.hour(Number(shift.startTime.split(':')[0])).minute(Number(shift.startTime.split(':')[1])).second(0);
        let workEnd = today.hour(Number(shift.endTime.split(':')[0])).minute(Number(shift.endTime.split(':')[1])).second(0);

        if (workEnd.isBefore(workStart)) {
          workEnd = workEnd.add(1, 'day');
        }

        // **แก้ไข: ตรวจสอบข้อมูลที่มีอยู่ให้แม่นยำขึ้น**
        const existingWorkTime = await this.workTimeRepository.findOne({
          where: {
            oeeId: shift.oeeId,
            startDateTime: workStart.toDate(),
            endDateTime: workEnd.toDate(),
          },
        });

        if (!existingWorkTime) {
          const durationMinutes = workEnd.diff(workStart, 'minute');
          const totalHours = Math.floor(durationMinutes / 60);
          const remainingMinutes = durationMinutes % 60;

          // บันทึกช่วงเวลาทำงานของกะนี้
          const workTime = this.workTimeRepository.create({
            oeeId: shift.oeeId,
            startDateTime: workStart.toDate(),
            endDateTime: workEnd.toDate(),
            totalHours,
            totalMinutes: remainingMinutes,
          });

          await this.workTimeRepository.save(workTime);
          this.logger.debug(`Recorded work time for OEE ID: ${shift.oeeId}, Start: ${workStart.format('YYYY-MM-DD HH:mm')}, End: ${workEnd.format('YYYY-MM-DD HH:mm')}`);
        } else {
          this.logger.debug(`Work time already exists for OEE ID: ${shift.oeeId}, Start: ${workStart.format('YYYY-MM-DD HH:mm')}, End: ${workEnd.format('YYYY-MM-DD HH:mm')}`);
        }
      }

      this.logger.debug('Finished pre-scheduling work time.');
    } catch (error) {
      this.logger.error('Error occurred while pre-scheduling work time.', error.stack);
    }
  }
}