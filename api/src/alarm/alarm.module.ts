import { Module } from '@nestjs/common';
import { AlarmService } from './alarm.service';
import { AlarmController } from './alarm.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteEntity } from '../common/entities/site-entity';
import { AlarmEntity } from '../common/entities/alarm-entity';

@Module({
  imports: [TypeOrmModule.forFeature([AlarmEntity, SiteEntity])],
  controllers: [AlarmController],
  providers: [AlarmService],
})
export class AlarmModule {}
