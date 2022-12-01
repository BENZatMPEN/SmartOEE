import { Module } from '@nestjs/common';
import { AlarmService } from './alarm.service';
import { AlarmController } from './alarm.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Site } from '../common/entities/site';
import { Alarm } from '../common/entities/alarm';

@Module({
  imports: [TypeOrmModule.forFeature([Alarm, Site])],
  controllers: [AlarmController],
  providers: [AlarmService],
})
export class AlarmModule {}
