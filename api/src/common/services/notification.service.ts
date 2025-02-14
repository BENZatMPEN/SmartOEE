import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from './email.service';
import { LineNotifyService } from './line-notify.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlarmEntity } from '../entities/alarm.entity';
import { ALARM_TYPE_EMAIL, ALARM_TYPE_LINE, defaultAlertTemplate } from '../constant';
import { AlarmEmailDataItem, AlarmLineData } from '../type/alarm';
import dayjs from 'dayjs';
import { LogService } from './log.service';
import { OeeBatchService } from '../../oee-batch/oee-batch.service';
import { SiteEntity } from '../entities/site.entity';
import Handlebars from 'handlebars';
import { OeeBatchEntity } from '../entities/oee-batch.entity';
import { OeeBatchNotificationEntity } from '../entities/oee-batch-notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    private readonly emailService: EmailService,
    private readonly lineNotifyService: LineNotifyService,
    private readonly oeeBatchService: OeeBatchService,
    private readonly logService: LogService,
    @InjectRepository(AlarmEntity)
    private alarmRepository: Repository<AlarmEntity>,
    @InjectRepository(SiteEntity)
    private siteRepository: Repository<SiteEntity>,
    @InjectRepository(OeeBatchEntity)
    private oeeBatchRepository: Repository<OeeBatchEntity>,
    @InjectRepository(OeeBatchNotificationEntity)
    private oeeBatchNotificationRepository: Repository<OeeBatchNotificationEntity>,
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
    const oeeBatch = await this.getOeeBatch(batchId);

    if (tagId) {
      const aParam = await this.oeeBatchService.findBatchAByIdAndTagId(batchId, tagId);
      const template = Handlebars.compile((site.alertTemplate || defaultAlertTemplate).aParamWithParam);
      message = template({
        oeeCode: oeeBatch.oee.oeeCode,
        productionName: oeeBatch.oee.productionName,
        sku: oeeBatch.product.sku,
        paramName: aParam.machineParameter.name,
        time: dayjs(timestamp).format('DD/MM/YYYY HH:mm'),
        seconds,
      });
    } else {
      const template = Handlebars.compile((site.alertTemplate || defaultAlertTemplate).aParamWithoutParam);
      message = template({
        oeeCode: oeeBatch.oee.oeeCode,
        productionName: oeeBatch.oee.productionName,
        sku: oeeBatch.product.sku,
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

  async notifyAParamStarted(
    siteId: number,
    oeeId: number,
    batchId: number,
    timestamp: Date,
    seconds: number,
  ): Promise<void> {
    let message = '';
    const site = await this.getSite(siteId);
    const oeeBatch = await this.getOeeBatch(batchId);
    const template = Handlebars.compile({ ...defaultAlertTemplate, ...site.alertTemplate }.aParamStarted);
    message = template({
      oeeCode: oeeBatch.oee.oeeCode,
      productionName: oeeBatch.oee.productionName,
      sku: oeeBatch.product.sku,
      time: dayjs(timestamp).format('DD/MM/YYYY HH:mm'),
      seconds,
    });

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
    const oeeBatch = await this.getOeeBatch(batchId);

    if (tagId) {
      const pParam = await this.oeeBatchService.findBatchPByIdAndTagId(batchId, tagId);
      const template = Handlebars.compile((site.alertTemplate || defaultAlertTemplate).pParamWithParam);
      message = template({
        oeeCode: oeeBatch.oee.oeeCode,
        productionName: oeeBatch.oee.productionName,
        sku: oeeBatch.product.sku,
        paramName: pParam.machineParameter.name,
        time: dayjs(timestamp).format('DD/MM/YYYY HH:mm'),
        seconds,
      });
    } else {
      const template = Handlebars.compile((site.alertTemplate || defaultAlertTemplate).pParamWithoutParam);
      message = template({
        oeeCode: oeeBatch.oee.oeeCode,
        productionName: oeeBatch.oee.productionName,
        sku: oeeBatch.product.sku,
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
    const oeeBatch = await this.getOeeBatch(batchId);
    const template = Handlebars.compile((site.alertTemplate || defaultAlertTemplate).qParamWithParam);
    const message = template({
      oeeCode: oeeBatch.oee.oeeCode,
      productionName: oeeBatch.oee.productionName,
      sku: oeeBatch.product.sku,
      paramName: qParam.machineParameter.name,
      previousAmount,
      currentAmount,
    });

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
    return this.siteRepository.findOneBy({ id: siteId });
  }

  private getOeeBatch(oeeBatchId: number): Promise<OeeBatchEntity> {
    return this.oeeBatchRepository.findOne({ where: { id: oeeBatchId }, relations: ['oee'] });
  }

  async notifyOee(
    name: string,
    siteId: number,
    oeeId: number,
    batchId: number,
    previousPercent: number,
    currentPercent: number,
  ): Promise<void> {
    const site = await this.getSite(siteId);
    const oeeBatch = await this.getOeeBatch(batchId);
    const template = Handlebars.compile({ ...defaultAlertTemplate, ...site.alertTemplate }[name]);
    const templateMessage = template({
      oeeCode: oeeBatch.oee.oeeCode,
      productionName: oeeBatch.oee.productionName,
      sku: oeeBatch.product.sku,
      previousPercent: previousPercent.toFixed(2),
      currentPercent: currentPercent.toFixed(2),
    });

    this.logger.log(templateMessage);
    await this.notify(siteId, oeeId, name, {
      message: templateMessage,
      subject: templateMessage,
      text: templateMessage,
      html: templateMessage,
    });
  }

  async findOeeBatchNotification(batchId: number, name: string): Promise<OeeBatchNotificationEntity> {
    return this.oeeBatchNotificationRepository.findOne({ where: { batchId: batchId, name: name } });
  }

  async findOeeBatchNotifications(batchId: number): Promise<OeeBatchNotificationEntity[]> {
    return this.oeeBatchNotificationRepository.find({ where: { batchId: batchId } });
  }

  async createOeeBatchNotification(name: string, batchId: number) {
    return this.oeeBatchNotificationRepository.save({
      name,
      batchId,
    });
  }

  async activateOeeBatchNotification(id: number) {
    return this.oeeBatchNotificationRepository.save({
      id,
      active: true,
    });
  }

  async deactivateOeeBatchNotification(id: number) {
    return this.oeeBatchNotificationRepository.save({
      id,
      active: false,
    });
  }
}
