import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from './email.service';
import { LineNotifyService } from './line-notify.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlarmEntity } from '../entities/alarm-entity';
import { ALARM_TYPE_EMAIL, ALARM_TYPE_LINE, defaultAlertTemplate } from '../constant';
import { AlarmEmailDataItem, AlarmLineData } from '../type/alarm';
import * as dayjs from 'dayjs';
import { LogService } from './log.service';
import { OeeBatchService } from '../../oee-batch/oee-batch.service';
import { SiteService } from '../../site/site.service';
import { SiteEntity } from '../entities/site-entity';
import Handlebars from 'handlebars';

@Injectable()
export class NotificationService {
  constructor(
    private readonly siteService: SiteService,
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
    const site = await this.getSite(siteId);

    if (tagId) {
      const aParam = await this.oeeBatchService.findBatchAByIdAndTagId(batchId, tagId);
      const template = Handlebars.compile((site.alertTemplate || defaultAlertTemplate).aParamWithParam);
      message = template({
        paramName: aParam.machineParameter.name,
        time: dayjs(timestamp).format('DD/MM/YYYY HH:mm'),
        seconds,
      });
    } else {
      const template = Handlebars.compile((site.alertTemplate || defaultAlertTemplate).aParamWithoutParam);
      message = template({
        time: dayjs(timestamp).format('DD/MM/YYYY HH:mm'),
        seconds,
      });
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
    const site = await this.getSite(siteId);

    if (tagId) {
      const pParam = await this.oeeBatchService.findBatchPByIdAndTagId(batchId, tagId);
      const template = Handlebars.compile((site.alertTemplate || defaultAlertTemplate).pParamWithParam);
      message = template({
        paramName: pParam.machineParameter.name,
        time: dayjs(timestamp).format('DD/MM/YYYY HH:mm'),
        seconds,
      });
    } else {
      const template = Handlebars.compile((site.alertTemplate || defaultAlertTemplate).pParamWithoutParam);
      message = template({
        time: dayjs(timestamp).format('DD/MM/YYYY HH:mm'),
        seconds,
      });
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
    const site = await this.getSite(siteId);
    const template = Handlebars.compile((site.alertTemplate || defaultAlertTemplate).qParamWithParam);
    const message = template({ paramName: qParam.machineParameter.name, previousAmount, currentAmount });

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

  private getAlarms(siteId: number): Promise<AlarmEntity[]> {
    return this.alarmRepository.find({ where: { siteId: siteId, notify: true, deleted: false } });
  }

  private getSite(siteId: number): Promise<SiteEntity> {
    return this.siteService.findById(siteId);
  }

  async notifyOeeLow(siteId: number, oeeId: number, previousPercent: number, currentPercent: number): Promise<void> {
    const site = await this.getSite(siteId);
    const template = Handlebars.compile((site.alertTemplate || defaultAlertTemplate).oeeLow);
    const message = template({
      previousPercent: previousPercent.toFixed(2),
      currentPercent: currentPercent.toFixed(2),
    });
    await this.notify(siteId, oeeId, 'oeeLow', {
      message,
      subject: message,
      text: message,
      html: message,
    });
  }

  async notifyALow(siteId: number, oeeId: number, previousPercent: number, currentPercent: number): Promise<void> {
    const site = await this.getSite(siteId);
    const template = Handlebars.compile((site.alertTemplate || defaultAlertTemplate).aLow);
    const message = template({
      previousPercent: previousPercent.toFixed(2),
      currentPercent: currentPercent.toFixed(2),
    });
    await this.notify(siteId, oeeId, 'aLow', {
      message,
      subject: message,
      text: message,
      html: message,
    });
  }

  async notifyPLow(siteId: number, oeeId: number, previousPercent: number, currentPercent: number): Promise<void> {
    const site = await this.getSite(siteId);
    const template = Handlebars.compile((site.alertTemplate || defaultAlertTemplate).pLow);
    const message = template({
      previousPercent: previousPercent.toFixed(2),
      currentPercent: currentPercent.toFixed(2),
    });
    await this.notify(siteId, oeeId, 'pLow', {
      message,
      subject: message,
      text: message,
      html: message,
    });
  }

  async notifyQLow(siteId: number, oeeId: number, previousPercent: number, currentPercent: number): Promise<void> {
    const site = await this.getSite(siteId);
    const template = Handlebars.compile((site.alertTemplate || defaultAlertTemplate).qLow);
    const message = template({
      previousPercent: previousPercent.toFixed(2),
      currentPercent: currentPercent.toFixed(2),
    });
    await this.notify(siteId, oeeId, 'qLow', {
      message,
      subject: message,
      text: message,
      html: message,
    });
  }
}
