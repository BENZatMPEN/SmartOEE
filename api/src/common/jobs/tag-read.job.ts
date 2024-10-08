import { Injectable, Logger } from '@nestjs/common';
import { OeeBatchService } from '../../oee-batch/oee-batch.service';
import { InjectRepository } from '@nestjs/typeorm';
import { TagReadEntity } from '../entities/tag-read.entity';
import { Repository } from 'typeorm';
import * as dayjs from 'dayjs';
import { NotificationService } from '../services/notification.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SocketService } from '../services/socket.service';
import { Read, ReadItem } from '../type/read';
import {
  OEE_BATCH_STATUS_BREAKDOWN,
  OEE_BATCH_STATUS_ENDED,
  OEE_BATCH_STATUS_MC_SETUP,
  OEE_BATCH_STATUS_PLANNED,
  OEE_BATCH_STATUS_RUNNING,
  OEE_BATCH_STATUS_STANDBY,
  OEE_BATCH_STATUS_UNKNOWN,
  OEE_TAG_MC_STATE,
  OEE_TAG_OUT_BATCH_STATUS,
  OEE_TAG_TOTAL,
  OEE_TAG_TOTAL_NG,
  PLANNED_DOWNTIME_TIMING_AUTO,
  PLANNED_DOWNTIME_TIMING_MANUAL,
  PLANNED_DOWNTIME_TIMING_TIMER,
  PLANNED_DOWNTIME_TYPE_MC_SETUP,
  PLANNED_DOWNTIME_TYPE_PLANNED,
} from '../constant';
import { OeeTag, OeeTagMCStatus, OeeTagOutBatchStatus } from '../type/oee-tag';
import { OeeBatchMcState } from '../type/oee-status';
import { OeeBatchPlannedDowntimeEntity } from '../entities/oee-batch-planned-downtime.entity';
import { OeeBatchEntity } from '../entities/oee-batch.entity';
import { Cron } from '@nestjs/schedule';
import { logBatch } from '../utils/batchHelper';
import { BatchAEvent } from '../events/batch-a.event';
import { BatchPEvent } from '../events/batch-p.event';
import { BatchQEvent } from '../events/batch-q.event';
import { BatchMcStateUpdateEvent, BatchTimelineUpdateEvent } from '../events/batch.event';
import { OeeBatchJobEntity } from '../entities/oee-batch-job.entity';

@Injectable()
export class TagReadJob {
  private readonly logger = new Logger(TagReadJob.name);

  constructor(
    private readonly oeeBatchService: OeeBatchService,
    private readonly socketService: SocketService,
    private readonly notificationService: NotificationService,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(TagReadEntity)
    private readonly tagReadRepository: Repository<TagReadEntity>,
    @InjectRepository(OeeBatchJobEntity)
    private readonly oeeBatchJobRepository: Repository<OeeBatchJobEntity>,
  ) {}

  @Cron('0/1 * * * * *')
  async handleCron() {
    const siteIds = await this.oeeBatchService.findWorkingSiteIds();
    this.processSites(siteIds);
  }

  private processSites(siteIds: number[]) {
    siteIds.forEach(async (siteId) => {
      // always latest tag
      const tagRead = await this.tagReadRepository.findOneBy({ siteId });
      if (tagRead) {
        const batchIds = await this.oeeBatchService.findWorkingBatchIdsBySiteId(siteId);
        this.processBatches(batchIds, tagRead);
      }
    });
  }

  private processBatches(batchIds: number[], tagRead: TagReadEntity) {
    batchIds.forEach(async (batchId) => {
      await this.processBatch(batchId, tagRead.read);
    });
  }

  private async invalidTagsStop(batch: OeeBatchEntity, oeeCode: string, readTimestamp: Date): Promise<void> {
    await this.eventEmitter.emitAsync(
      'batch-mc-state.update',
      new BatchMcStateUpdateEvent(
        batch,
        new OeeBatchMcState('0', 0, 0, OEE_BATCH_STATUS_ENDED, 0, null, readTimestamp),
      ),
    );

    await this.oeeBatchService.update1(batch.id, {
      toBeStopped: false,
      batchStoppedDate: dayjs().startOf('s').toDate(),
    });

    const batchJob = await this.oeeBatchJobRepository.findOne({ where: { oeeBatchId: batch.id } });
    await this.oeeBatchJobRepository.save({
      id: batchJob.id,
      batchJobEnded: new Date(),
      dataJobEnded: new Date(),
    });

    logBatch(this.logger, batch.id, oeeCode, `oee batch is stopped because of invalid tags or reads`);
  }

  private async validateMandatoryTags(
    tagMcState: OeeTag,
    tagTotal: OeeTag,
    tagTotalNg: OeeTag,
    batch: OeeBatchEntity,
    oeeCode: string,
  ): Promise<boolean> {
    if (tagMcState && tagTotal && tagTotalNg) {
      return true;
    }

    if (!tagMcState) {
      logBatch(this.logger, batch.id, oeeCode, `m/c State tag is not set`);
    }

    if (!tagTotal) {
      logBatch(this.logger, batch.id, oeeCode, `total tag is not set`);
    }

    if (!tagTotalNg) {
      logBatch(this.logger, batch.id, oeeCode, `total ng tag is not set`);
    }

    return false;
  }

  private async validateMandatoryTagReads(
    currentTagMcState: ReadItem,
    currentTagTotal: ReadItem,
    currentTagTotalNg: ReadItem,
    batch: OeeBatchEntity,
    oeeCode: string,
  ): Promise<boolean> {
    if (currentTagMcState && currentTagTotal && currentTagTotalNg) {
      return true;
    }

    if (!currentTagMcState) {
      logBatch(this.logger, batch.id, oeeCode, `m/c state value is not found in the current tag reads`);
    }

    if (!currentTagTotal) {
      logBatch(this.logger, batch.id, oeeCode, `total value is not found in the current tag reads`);
    }

    if (!currentTagTotalNg) {
      logBatch(this.logger, batch.id, oeeCode, `total NG value is not found in the current tag reads`);
    }

    return false;
  }

  private async processBatch(batchId: number, tagRead: Read): Promise<void> {
    try {
      const batch = await this.oeeBatchService.findWithOeeById(batchId);
      const { oeeCode, tags: oeeTags } = batch.oee;
      const readTimestamp = dayjs().startOf('s').toDate();
      const allReads = tagRead.deviceReads.map((item) => item.reads).flat();

      const tagMcState = this.findOeeTag(OEE_TAG_MC_STATE, oeeTags);
      const tagTotal = this.findOeeTag(OEE_TAG_TOTAL, oeeTags);
      const tagTotalNg = this.findOeeTag(OEE_TAG_TOTAL_NG, oeeTags);
      const isValidTags = await this.validateMandatoryTags(tagMcState, tagTotal, tagTotalNg, batch, oeeCode);
      if (!isValidTags) {
        await this.invalidTagsStop(batch, oeeCode, readTimestamp);
        return;
      }

      const currentTagMcState = this.findRead(tagMcState.tagId, allReads);
      const currentTagTotal = this.findRead(tagTotal.tagId, allReads);
      const currentTagTotalNg = this.findRead(tagTotalNg.tagId, allReads);
      const isValidTagReads = await this.validateMandatoryTagReads(
        currentTagMcState,
        currentTagTotal,
        currentTagTotalNg,
        batch,
        oeeCode,
      );
      if (!isValidTagReads) {
        // await this.invalidTagsStop(batch, oeeCode, readTimestamp);
        return;
      }

      const previousMcState = {
        ...batch.mcState,
        timestamp: batch.batchStartedDate,
      };

      const currentMcState = new OeeBatchMcState(
        currentTagMcState.read,
        Number(currentTagTotal.read),
        Number(currentTagTotalNg.read),
        OEE_BATCH_STATUS_UNKNOWN,
        0,
        null,
        readTimestamp,
      );

      const activePD = await this.oeeBatchService.findActivePlannedDowntimeById(batch.id);
      if (activePD) {
        logBatch(this.logger, batch.id, oeeCode, `planned downtime: ${activePD.type} timing: ${activePD.timing}`);
        let expired = false;

        if (activePD.toBeExpired) {
          expired = true;
        } else {
          if (activePD.timing === PLANNED_DOWNTIME_TIMING_AUTO && currentMcState.total > previousMcState.total) {
            logBatch(this.logger, batch.id, oeeCode, 'planned downtime expired - auto');
            expired = true;
          } else if (activePD.timing === PLANNED_DOWNTIME_TIMING_TIMER) {
            const expirationDate = dayjs(activePD.createdAt).add(activePD.seconds, 's');
            const timeCounter = expirationDate.diff(dayjs(), 's');
            logBatch(this.logger, batch.id, oeeCode, `planned downtime - timer: ${timeCounter}`);

            if (timeCounter <= 0) {
              logBatch(this.logger, batch.id, oeeCode, 'planned downtime expired - timer');
              expired = true;
            }
          }
        }

        if (expired) {
          await this.oeeBatchService.expireActivePlannedDowntime(activePD);
          activePD.expiredAt = readTimestamp;
        }
      }

      if (
        (!activePD && currentMcState.total === previousMcState.total) ||
        (activePD && !activePD.expiredAt && activePD.type === PLANNED_DOWNTIME_TYPE_MC_SETUP)
      ) {
        const stopDate = previousMcState.stopTimestamp ? previousMcState.stopTimestamp : readTimestamp;
        currentMcState.stopTimestamp = stopDate;
        currentMcState.stopSeconds = dayjs().startOf('s').diff(stopDate, 's');
      } else {
        currentMcState.stopTimestamp = null;
        currentMcState.stopSeconds = 0;
      }

      logBatch(
        this.logger,
        batch.id,
        oeeCode,
        `timestamp - previous: ${
          previousMcState.timestamp ? dayjs(previousMcState.timestamp).format('HH:mm:ss') : 'none'
        }, current: ${dayjs(currentMcState.timestamp).format('HH:mm:ss')}`,
      );
      logBatch(
        this.logger,
        batch.id,
        oeeCode,
        `mc_status - previous: ${previousMcState.mcStatus}, current: ${currentMcState.mcStatus}`,
      );
      logBatch(
        this.logger,
        batch.id,
        oeeCode,
        `total seconds - previous: ${dayjs(currentMcState.timestamp).diff(batch.batchStartedDate, 's')}`,
      );
      logBatch(
        this.logger,
        batch.id,
        oeeCode,
        `total count - previous: ${previousMcState.total}, current: ${currentMcState.total}`,
      );
      logBatch(
        this.logger,
        batch.id,
        oeeCode,
        `total defects - previous: ${previousMcState.totalNg}, current: ${currentMcState.totalNg}`,
      );
      logBatch(
        this.logger,
        batch.id,
        oeeCode,
        `stop count - previous: ${previousMcState.stopSeconds}, current: ${currentMcState.stopSeconds}`,
      );

      const tagMcStateData: OeeTagMCStatus = tagMcState.data;

      if (batch.batchStoppedDate || batch.toBeStopped) {
        currentMcState.batchStatus = OEE_BATCH_STATUS_ENDED;
      } else if (activePD && !activePD.expiredAt) {
        if (activePD.type === PLANNED_DOWNTIME_TYPE_PLANNED) {
          currentMcState.batchStatus = OEE_BATCH_STATUS_PLANNED;
        } else if (activePD.type === PLANNED_DOWNTIME_TYPE_MC_SETUP) {
          currentMcState.batchStatus = OEE_BATCH_STATUS_MC_SETUP;
        }
      } else if (currentMcState.stopSeconds >= batch.breakdownSeconds) {
        currentMcState.batchStatus = OEE_BATCH_STATUS_BREAKDOWN;
        await this.eventEmitter.emitAsync(
          'batch-a-started-params.process',
          new BatchAEvent(batch, currentMcState, allReads, readTimestamp),
        );
      } else if (currentTagMcState.read === tagMcStateData.standby) {
        currentMcState.batchStatus = OEE_BATCH_STATUS_STANDBY;
      } else if (currentTagMcState.read === tagMcStateData.running) {
        currentMcState.batchStatus = OEE_BATCH_STATUS_RUNNING;
      }

      logBatch(
        this.logger,
        batch.id,
        oeeCode,
        `batch status - previous: ${previousMcState.batchStatus}, current: ${currentMcState.batchStatus}`,
      );

      await this.eventEmitter.emitAsync('batch-mc-state.update', new BatchMcStateUpdateEvent(batch, currentMcState));

      await this.eventEmitter.emitAsync(
        'batch-timeline.update',
        new BatchTimelineUpdateEvent(batch, previousMcState, currentMcState),
      );

      // send batch status
      const tagOutBatchStatus = this.findOeeTag(OEE_TAG_OUT_BATCH_STATUS, oeeTags);
      const outVal = this.getTagBatchStatus(currentMcState.batchStatus, activePD, tagOutBatchStatus);
      this.sendBatchStatus(batch, oeeCode, oeeTags, outVal);

      // when back to normal. check if there is any A or P
      if (
        currentMcState.stopSeconds === 0 &&
        previousMcState.stopSeconds > 0 &&
        previousMcState.stopSeconds > batch.standardSpeedSeconds
      ) {
        // A
        if (previousMcState.stopSeconds >= batch.breakdownSeconds) {
          await this.eventEmitter.emitAsync(
            'batch-a-params.process',
            new BatchAEvent(batch, previousMcState, allReads, readTimestamp),
          );
        }
        // P
        else {
          await this.eventEmitter.emitAsync(
            'batch-p-params.process',
            new BatchPEvent(batch, previousMcState, allReads, readTimestamp),
          );
        }
      }

      // check Q
      if (currentMcState.totalNg > previousMcState.totalNg) {
        await this.eventEmitter.emitAsync('batch-q-params.process', new BatchQEvent(batch, allReads, readTimestamp));
      }

      if (batch.toBeStopped) {
        await this.oeeBatchService.update1(batch.id, {
          toBeStopped: false,
          batchStoppedDate: dayjs().startOf('s').toDate(),
        });

        const tagOutBatchStatus = this.findOeeTag(OEE_TAG_OUT_BATCH_STATUS, oeeTags);
        this.sendBatchStatus(batch, oeeCode, oeeTags, tagOutBatchStatus?.data?.standby || '');

        logBatch(this.logger, batch.id, oeeCode, `batch stopped.`);
      }
    } catch (error) {
      this.logger.error('exception', error);
    }
  }

  private findOeeTag(key: string, oeeTags: OeeTag[]): OeeTag {
    const itemIndex = oeeTags.findIndex((item) => item.key === key && item.tagId);
    if (itemIndex < 0) {
      return null;
    }
    return oeeTags[itemIndex];
  }

  private findRead(tagId: number, reads: ReadItem[]): ReadItem {
    const itemIndex = reads.findIndex((item) => item.tagId === tagId);
    if (itemIndex < 0) {
      return null;
    }
    return reads[itemIndex];
  }

  private sendBatchStatus(batch: OeeBatchEntity, oeeCode: string, oeeTags: OeeTag[], outVal: string) {
    const tagOutBatchStatus = this.findOeeTag(OEE_TAG_OUT_BATCH_STATUS, oeeTags);
    if (tagOutBatchStatus === null) {
      logBatch(this.logger, batch.id, oeeCode, `send batch status - OEE batch status out isn't set`);
      return;
    }

    if (!outVal || outVal === '') {
      logBatch(this.logger, batch.id, oeeCode, `send batch status - out value isn't provided`);
      return;
    }

    const { deviceId, tagId } = tagOutBatchStatus;
    logBatch(
      this.logger,
      batch.id,
      oeeCode,
      `send batch status - deviceId: ${deviceId}, tagId: ${tagId}, val: ${outVal}`,
    );

    this.socketService.socket.to(`site_${batch.siteId}`).emit(`tag_out`, {
      deviceId: deviceId,
      tagId: tagId,
      value: outVal,
    });
  }

  private getTagBatchStatus(
    batchStatus: string,
    activePD: OeeBatchPlannedDowntimeEntity,
    tagOutBatchStatus: OeeTag,
  ): string {
    const data: OeeTagOutBatchStatus = tagOutBatchStatus.data;
    switch (batchStatus) {
      case OEE_BATCH_STATUS_RUNNING:
        return data.running;

      case OEE_BATCH_STATUS_STANDBY:
        return data.standby;

      case OEE_BATCH_STATUS_BREAKDOWN:
        return data.breakdown;

      case OEE_BATCH_STATUS_PLANNED:
        if (activePD.timing === PLANNED_DOWNTIME_TIMING_AUTO) {
          return data.plannedDowntimeAuto;
        } else if (activePD.timing === PLANNED_DOWNTIME_TIMING_MANUAL) {
          return data.plannedDowntimeManual;
        }
        return '';

      case OEE_BATCH_STATUS_MC_SETUP:
        return data.mcSetup;

      default:
        return '';
    }
  }
}
