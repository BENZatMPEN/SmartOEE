import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from './email.service';
import { LineNotifyService } from './line-notify.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlarmEntity } from '../entities/alarm-entity';
import { ALARM_TYPE_EMAIL, ALARM_TYPE_LINE } from '../constant';
import { AlarmEmailDataItem, AlarmLineData } from '../type/alarm';
import * as dayjs from 'dayjs';
import { LogService } from './log.service';
import { OeeBatchService } from '../../oee-batch/oee-batch.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly emailService: EmailService,
    private readonly lineNotifyService: LineNotifyService,
    private readonly oeeBatchService: OeeBatchService,
    private readonly logService: LogService,
    @InjectRepository(AlarmEntity)
    private alarmRepository: Repository<AlarmEntity>,
  ) {}

  private readonly logger = new Logger(NotificationService.name);

  async notifyAParam(
    siteId: number,
    oeeId: number,
    batchId: number,
    tagId: number,
    timestamp: Date,
    seconds: number,
  ): Promise<void> {
    let message = '';
    if (tagId) {
      const aParam = await this.oeeBatchService.findBatchAByIdAndTagId(batchId, tagId);
      message = `${aParam.machineParameter.name} has occurred at ${dayjs(timestamp).format(
        'DD/MM/YYYY HH:mm',
      )} - ${seconds} seconds.`;
    } else {
      message = `Breakdown has occurred at ${dayjs(timestamp).format('DD/MM/YYYY HH:mm')} - ${seconds} seconds.`;
    }

    this.logger.log(message);
    await this.notify(siteId, oeeId, 'aParams', {
      message,
      subject: message,
      text: message,
      html: message,
    });
  }

  async notifyPParam(
    siteId: number,
    oeeId: number,
    batchId: number,
    tagId: number,
    timestamp: Date,
    seconds: number,
  ): Promise<void> {
    let message = '';
    if (tagId) {
      const pParam = await this.oeeBatchService.findBatchPByIdAndTagId(batchId, tagId);
      message = `${pParam.machineParameter.name} has occurred at ${dayjs(timestamp).format(
        'DD/MM/YYYY HH:mm',
      )} - ${seconds} seconds.`;
    } else {
      message = `Minor Loss has occurred at ${dayjs(timestamp).format('DD/MM/YYYY HH:mm')} - ${seconds} seconds.`;
    }

    this.logger.log(message);
    await this.notify(siteId, oeeId, 'pParams', {
      message,
      subject: message,
      text: message,
      html: message,
    });
  }

  async notifyQParam(
    siteId: number,
    oeeId: number,
    batchId: number,
    tagId: number,
    previousAmount: number,
    currentAmount: number,
  ): Promise<void> {
    const qParam = await this.oeeBatchService.findBatchQByIdAndTagId(batchId, tagId);
    const message = `${qParam.machineParameter.name} has increased from ${previousAmount} to ${currentAmount}.`;

    this.logger.log(message);
    await this.notify(siteId, oeeId, 'qParams', {
      message,
      subject: message,
      text: message,
      html: message,
    });
  }

  private async notify(siteId: number, oeeId: number, condition: string, options: any): Promise<void> {
    const alarms = await this.getAlarms(siteId);
    await this.logService.logAlarm(siteId, options.message);

    for (const alarm of alarms) {
      if (!alarm.condition[condition] && (alarm.condition.oees || []).indexOf(oeeId) < 0) {
        continue;
      }

      if (alarm.type === ALARM_TYPE_EMAIL) {
        const data = alarm.data as AlarmEmailDataItem[];
        await this.emailService.send(
          options,
          data.map((item) => item.email),
        );
      } else if (alarm.type === ALARM_TYPE_LINE) {
        const data = alarm.data as AlarmLineData;
        await this.lineNotifyService.send(options.message, data.token);
      }
    }
  }

  getAlarms(siteId: number): Promise<AlarmEntity[]> {
    return this.alarmRepository.find({ where: { siteId: siteId, notify: true, deleted: false } });
  }

  async notifyOeeLow(siteId: number, oeeId: number, previousPercent: number, currentPercent: number): Promise<void> {
    const message = `OEE low - previous: ${previousPercent}, current: ${currentPercent}`;
    await this.notify(siteId, oeeId, 'oeeLow', {
      message,
      subject: message,
      text: message,
      html: message,
    });
  }

  async notifyALow(siteId: number, oeeId: number, previousPercent: number, currentPercent: number): Promise<void> {
    const message = `A low - previous: ${previousPercent}, current: ${currentPercent}`;
    await this.notify(siteId, oeeId, 'aLow', {
      message,
      subject: message,
      text: message,
      html: message,
    });
  }

  async notifyPLow(siteId: number, oeeId: number, previousPercent: number, currentPercent: number): Promise<void> {
    const message = `P low - previous: ${previousPercent}, current: ${currentPercent}`;
    await this.notify(siteId, oeeId, 'pLow', {
      message,
      subject: message,
      text: message,
      html: message,
    });
  }

  async notifyQLow(siteId: number, oeeId: number, previousPercent: number, currentPercent: number): Promise<void> {
    const message = `Q low - previous: ${previousPercent}, current: ${currentPercent}`;
    await this.notify(siteId, oeeId, 'qLow', {
      message,
      subject: message,
      text: message,
      html: message,
    });
  }
}
