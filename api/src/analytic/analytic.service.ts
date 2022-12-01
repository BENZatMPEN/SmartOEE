import { Injectable } from '@nestjs/common';
import { CreateAnalyticDto } from './dto/create-analytic.dto';
import { UpdateAnalyticDto } from './dto/update-analytic.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Analytic } from '../common/entities/analytic';
import * as _ from 'lodash';
import * as dayjs from 'dayjs';
import { AnalyticStats } from '../common/entities/analytic-stats';
import { initialOeeBatchStats } from '../common/type/oee-stats';
import { AnalyticData } from '../common/type/analytic-data';
import { Site } from '../common/entities/site';
import { Oee } from '../common/entities/oee';
import { OeeBatch } from '../common/entities/oee-batch';
import { Product } from '../common/entities/product';
import { OeeBatchStats } from '../common/entities/oee-batch-stats';
import * as isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import * as isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import * as isBetween from 'dayjs/plugin/isBetween';
import { OeeBatchStatsTimeline } from '../common/entities/oee-batch-stats-timeline';
import { authorize } from 'passport';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);

@Injectable()
export class AnalyticService {
  constructor(
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
    @InjectRepository(Oee)
    private readonly oeeRepository: Repository<Oee>,
    @InjectRepository(OeeBatch)
    private readonly oeeBatchRepository: Repository<OeeBatch>,
    @InjectRepository(OeeBatchStats)
    private readonly oeeBatchStatsRepository: Repository<OeeBatchStats>,
    @InjectRepository(OeeBatchStatsTimeline)
    private readonly oeeBatchStatsTimelineRepository: Repository<OeeBatchStatsTimeline>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Analytic)
    private readonly analyticRepository: Repository<Analytic>,
    @InjectRepository(AnalyticStats)
    private readonly analyticStatsRepository: Repository<AnalyticStats>,
    private readonly entityManager: EntityManager,
  ) {}

  findAll(group: boolean, siteId: number): Promise<Analytic[]> {
    return this.analyticRepository.findBy({ siteId, group });
  }

  findById(id: number, siteId: number): Promise<Analytic> {
    return this.analyticRepository.findOneBy({ id, siteId });
  }

  create(createDto: CreateAnalyticDto): Promise<Analytic> {
    return this.analyticRepository.save({
      ...createDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(id: number, updateDto: UpdateAnalyticDto): Promise<Analytic> {
    const updatingAnalytic = await this.analyticRepository.findOneBy({ id });
    return this.analyticRepository.save({
      ..._.assign(updatingAnalytic, updateDto),
      updatedAt: new Date(),
    });
  }

  async delete(id: number): Promise<void> {
    const analytic = await this.analyticRepository.findOneBy({ id });
    await this.analyticRepository.remove(analytic);
  }

  // DO NOT USE this in the production
  async recalculateAll(): Promise<void> {
    const rows = await this.oeeBatchRepository.createQueryBuilder().addSelect(['id']).getRawMany();
    const batchIds = rows.map((row) => row.id);
    this.recalculateBatches(batchIds);
  }

  recalculateBatches(batchIds: number[]) {
    batchIds.forEach(async (batchId) => {
      await this.recalculateBatch(batchId);
    });
  }

  async recalculateBatch(batchId: number) {
    // calculate all the batch from the beginning
    const batchStatsFirst = await this.oeeBatchStatsRepository.findOne({
      where: { oeeBatchId: batchId },
      order: { timestamp: 'ASC' },
    });
    const batchStatsLast = await this.oeeBatchStatsRepository.findOne({
      where: { oeeBatchId: batchId },
      order: { timestamp: 'DESC' },
    });

    if (!batchStatsFirst || !batchStatsLast) {
      return;
    }

    const batch = await this.oeeBatchRepository.findOneBy({ id: batchId });
    const { siteId, oeeId, product, standardSpeedSeconds } = batch;

    // delete the existing data before recalculation
    await this.analyticStatsRepository.delete({ oeeBatchId: batch.id });

    const batchStartDay = dayjs(batchStatsFirst.timestamp).startOf('h');
    const batchEndDay = dayjs(batchStatsLast.timestamp).startOf('h');
    const batchHours = (batchEndDay.diff(batchStartDay, 'h') + 1) * 2;
    let lastCutoffData = initialOeeBatchStats;

    const tempData: AnalyticStats[] = [];

    for (let i = 0; i < batchHours; i++) {
      const currentHour = batchStartDay.add(i * 30, 'm');
      const currentStats = await this.oeeBatchStatsRepository
        .createQueryBuilder()
        .where(`oeeBatchId = :oeeBatchId`, { oeeBatchId: batchId })
        .andWhere('timestamp >= :from and timestamp <= :to', {
          from: currentHour.toDate(),
          to: currentHour.add(30, 'm').toDate(),
        })
        .orderBy({ timestamp: 'DESC' })
        .getOne();

      if (!currentStats) {
        continue;
      }

      const {
        runningSeconds,
        plannedDowntimeSeconds,
        machineSetupSeconds,
        totalCount,
        totalBreakdownSeconds,
        totalStopSeconds,
        totalSpeedLossSeconds,
        totalMinorStopSeconds,
        totalManualDefects,
        totalAutoDefects,
        totalOtherDefects,
      } = currentStats.data;

      const currentData: AnalyticData = {
        standardSpeedSeconds: standardSpeedSeconds,
        runningSeconds: runningSeconds - lastCutoffData.runningSeconds,
        plannedDowntimeSeconds: plannedDowntimeSeconds - lastCutoffData.plannedDowntimeSeconds,
        machineSetupSeconds: machineSetupSeconds - lastCutoffData.machineSetupSeconds,
        totalCount: totalCount - lastCutoffData.totalCount,
        totalBreakdownSeconds: totalBreakdownSeconds - lastCutoffData.totalBreakdownSeconds,
        totalStopSeconds: totalStopSeconds - lastCutoffData.totalStopSeconds,
        totalSpeedLossSeconds: totalSpeedLossSeconds - lastCutoffData.totalSpeedLossSeconds,
        totalMinorStopSeconds: totalMinorStopSeconds - lastCutoffData.totalMinorStopSeconds,
        totalManualDefects: totalManualDefects - lastCutoffData.totalManualDefects,
        totalAutoDefects: totalAutoDefects - lastCutoffData.totalAutoDefects,
        totalOtherDefects: totalOtherDefects - lastCutoffData.totalOtherDefects,
      };

      tempData.push({
        siteId,
        oeeId,
        productId: product.id,
        oeeBatchId: batch.id,
        timestamp: currentHour.toDate(),
        data: currentData,
      } as AnalyticStats);

      lastCutoffData = currentStats.data;
    }

    await this.analyticStatsRepository.save(tempData);

    // // by hour
    // const groupHour = tempData.reduce((acc, item) => {
    //   const key = dayjs(item.timestamp).startOf('h').format('YYYY-MM-DD HH:mm');
    //   if (key in acc) {
    //     acc[key].push(item);
    //   } else {
    //     acc[key] = [item];
    //   }
    //   return acc;
    // }, {});
    //
    // const sumHourRows = Object.keys(groupHour).map((key) => this.calculateOee(groupHour[key], 'time', key));
    //
    // console.log(sumHourRows);
    //
    // const site = await this.siteRepository.findOneBy({ id: siteId });
    // const cutoffHour = dayjs(site.cutoffTime);
    //
    // // by day
    // const startDay = dayjs(tempData[0].timestamp);
    // const endDay = dayjs(tempData[tempData.length - 1].timestamp);
    //
    // const startCutoffDay = startDay.startOf('d').hour(cutoffHour.hour()).minute(cutoffHour.minute());
    // const endCutoffDay = endDay.startOf('d').hour(cutoffHour.hour()).minute(cutoffHour.minute()).add(-1, 's');
    //
    // const startSlotDay = startDay.isSameOrBefore(startCutoffDay) ? startCutoffDay.add(-1, 'd') : startCutoffDay;
    // const endSlotDay = endDay.isSameOrAfter(endCutoffDay) ? endCutoffDay.add(1, 'd') : endCutoffDay;
    // const days = endSlotDay.diff(startSlotDay, 'd') + 1;
    // const groupDay = {};
    //
    // for (let i = 0; i < days; i++) {
    //   const startRangeDate = startSlotDay.add(i, 'd');
    //   const endRangeDate = startSlotDay.add(i + 1, 'd').add(-1, 's');
    //   const key = startSlotDay.add(i, 'd').format('YYYY-MM-DD');
    //
    //   groupDay[key] = tempData.filter((item) => {
    //     return item.timestamp >= startRangeDate.toDate() && item.timestamp <= endRangeDate.toDate();
    //   });
    // }
    //
    // const sumDayRows = Object.keys(groupDay).map((key) => this.calculateOee(groupDay[key], 'time', key));
    //
    // console.log(sumDayRows);
    //
    // // by month
    // const startMonth = dayjs(tempData[0].timestamp);
    // const endMonth = dayjs(tempData[tempData.length - 1].timestamp);
    //
    // const startCutoffMonth = startMonth.startOf('M').hour(cutoffHour.hour()).minute(cutoffHour.minute());
    // const endCutoffMonth = endMonth
    //   .endOf('M')
    //   .startOf('d')
    //   .hour(cutoffHour.hour())
    //   .minute(cutoffHour.minute())
    //   .add(-1, 's');
    //
    // const startSlotMonth = startMonth.isSameOrBefore(startCutoffMonth)
    //   ? startCutoffMonth.add(-1, 'd')
    //   : startCutoffMonth;
    // const endSlotMonth = endMonth.isSameOrAfter(endCutoffMonth) ? endCutoffMonth.add(1, 'd') : endCutoffMonth;
    // const months = endSlotMonth.diff(startSlotMonth, 'M') + 1;
    // const groupMonth = {};
    //
    // for (let i = 0; i < months; i++) {
    //   const startRangeDate = startSlotMonth.add(i, 'M');
    //   const endRangeDate = startSlotMonth.add(i + 1, 'M').add(-1, 's');
    //   const key = startSlotMonth.add(i, 'M').format('YYYY-MM-DD');
    //
    //   groupMonth[key] = tempData.filter((item) => {
    //     return item.timestamp >= startRangeDate.toDate() && item.timestamp <= endRangeDate.toDate();
    //   });
    // }
    //
    // const sumMonthRows = Object.keys(groupMonth).map((key) => this.calculateOee(groupMonth[key], 'time', key));
    //
    // console.log(sumMonthRows);
  }

  // OEE - By Time - Bar
  // day or sum of days in month for a OEE, Product or Lot
  // From - To
  // Single OEE, Product or Lot

  async findOeeByTime(
    siteId: number,
    chartType: string,
    ids: number[],
    duration: string,
    from: Date,
    to: Date,
  ): Promise<any> {
    const fieldName = this.getFieldName(chartType);
    const rows = await this.analyticStatsRepository
      .createQueryBuilder()
      .where(`${fieldName} IN (:...ids)`, { ids })
      .andWhere('timestamp >= :from and timestamp <= :to', { from, to })
      .orderBy('timestamp')
      .getMany();

    if (rows.length === 0) {
      return {
        rows: [],
        sumRows: [],
      };
    }

    const site = await this.siteRepository.findOneBy({ id: siteId });
    const cutoffHour = dayjs(site.cutoffTime);

    if (duration === 'hourly') {
      // by hour
      const groupHour = rows.reduce((acc, item) => {
        const key = dayjs(item.timestamp).startOf('h').toISOString();
        if (key in acc) {
          acc[key].push(item);
        } else {
          acc[key] = [item];
        }
        return acc;
      }, {});

      const sumRows = Object.keys(groupHour).map((key) => this.calculateOee(groupHour[key], key));

      return {
        rows: groupHour,
        sumRows,
      };
    } else if (duration === 'daily') {
      // by day
      const startDay = dayjs(rows[0].timestamp);
      const endDay = dayjs(rows[rows.length - 1].timestamp);

      const startCutoffDay = startDay.startOf('d').hour(cutoffHour.hour()).minute(cutoffHour.minute());
      const endCutoffDay = endDay.startOf('d').hour(cutoffHour.hour()).minute(cutoffHour.minute()).add(-1, 's');

      const startSlotDay = startDay.isSameOrBefore(startCutoffDay) ? startCutoffDay.add(-1, 'd') : startCutoffDay;
      const endSlotDay = endDay.isSameOrAfter(endCutoffDay) ? endCutoffDay.add(1, 'd') : endCutoffDay;
      const days = endSlotDay.diff(startSlotDay, 'd') + 1;
      const groupDay = {};

      for (let i = 0; i < days; i++) {
        const startRangeDate = startSlotDay.add(i, 'd');
        const endRangeDate = startSlotDay.add(i + 1, 'd').add(-1, 's');
        const key = startSlotDay.add(i, 'd').toISOString();

        groupDay[key] = rows.filter((item) => {
          return item.timestamp >= startRangeDate.toDate() && item.timestamp <= endRangeDate.toDate();
        });
      }

      const sumRows = Object.keys(groupDay).map((key) => this.calculateOee(groupDay[key], key));

      return {
        rows: groupDay,
        sumRows,
      };
    } else if (duration === 'monthly') {
      // by month
      const startMonth = dayjs(rows[0].timestamp);
      const endMonth = dayjs(rows[rows.length - 1].timestamp);

      const startCutoffMonth = startMonth.startOf('M').hour(cutoffHour.hour()).minute(cutoffHour.minute());
      const endCutoffMonth = endMonth
        .endOf('M')
        .startOf('d')
        .hour(cutoffHour.hour())
        .minute(cutoffHour.minute())
        .add(-1, 's');

      const startSlotMonth = startMonth.isSameOrBefore(startCutoffMonth)
        ? startCutoffMonth.add(-1, 'd')
        : startCutoffMonth;
      const endSlotMonth = endMonth.isSameOrAfter(endCutoffMonth) ? endCutoffMonth.add(1, 'd') : endCutoffMonth;
      const months = endSlotMonth.diff(startSlotMonth, 'M') + 1;
      const groupMonth = {};

      for (let i = 0; i < months; i++) {
        const startRangeDate = startSlotMonth.add(i, 'M');
        const endRangeDate = startSlotMonth.add(i + 1, 'M').add(-1, 's');
        const key = startSlotMonth.add(i, 'M').toISOString();

        groupMonth[key] = rows.filter((item) => {
          return item.timestamp >= startRangeDate.toDate() && item.timestamp <= endRangeDate.toDate();
        });
      }

      const sumRows = Object.keys(groupMonth).map((key) => this.calculateOee(groupMonth[key], key));

      return {
        rows: groupMonth,
        sumRows,
      };
    } else {
      return {
        rows: [],
        sumRows: [],
      };
    }
  }

  // OEE - By M/C - Bar
  // sum of days (from - to) for each of selected OEEs, Products or Lots
  // From - To
  // Multiple OEEs, Products or Lots

  async findOeeByObject(
    siteId: number,
    chartType: string,
    ids: number[],
    duration: string,
    from: Date,
    to: Date,
  ): Promise<any> {
    const fieldName = this.getFieldName(chartType);
    const rows = await this.analyticStatsRepository
      .createQueryBuilder()
      .where(`${fieldName} IN (:...ids)`, { ids })
      .andWhere('timestamp >= :from and timestamp <= :to', { from, to })
      .getMany();

    console.log(rows);

    if (rows.length === 0) {
      return {
        rows: [],
        sumRows: [],
      };
    }

    const group = rows.reduce((acc, item) => {
      const key = item[fieldName];
      if (key in acc) {
        acc[key].push(item);
      } else {
        acc[key] = [item];
      }
      return acc;
    }, {});

    const sumRows = [];
    for (const key of Object.keys(group)) {
      const objName = await this.getObjectName(Number(key), chartType);
      sumRows.push(await this.calculateOee(group[key], objName));
    }

    return {
      rows,
      sumRows,
    };
  }

  // MC - By Time - Bar
  // day or sum of days in month for a OEE, Product or Lot
  // From - To
  // Single OEE, Product or Lot

  async findMcByTime(
    siteId: number,
    chartType: string,
    ids: number[],
    duration: string,
    from: Date,
    to: Date,
  ): Promise<any> {
    const fieldName = this.getFieldName(chartType);
    const rows = await this.oeeBatchStatsTimelineRepository
      .createQueryBuilder()
      .where(`${fieldName} IN (:...ids)`, { ids })
      .andWhere('fromDate >= :from and toDate <= :to', { from, to })
      .getMany();

    // const rows = await this.analyticStatsRepository
    //   .createQueryBuilder()
    //   .where(`${fieldName} IN (:...ids)`, { ids })
    //   .andWhere('timestamp >= :from and timestamp <= :to', { from, to })
    //   .orderBy('timestamp')
    //   .getMany();

    if (rows.length === 0) {
      return {
        rows: [],
        sumRows: [],
      };
    }

    const site = await this.siteRepository.findOneBy({ id: siteId });
    const cutoffHour = dayjs(site.cutoffTime);

    const startDate = dayjs(rows[0].fromDate).startOf('h');
    const endDate = dayjs(rows[rows.length - 1].toDate)
      .startOf('h')
      .add(1, 'h');

    if (duration === 'hourly') {
      const hours = endDate.diff(startDate, 'h') + 1;

      for (let i = 0; i < hours; i++) {
        const currentHour = startDate.startOf('h').add(i, 'h');
        const tempRows = rows.filter((row) => currentHour.isBetween(row.fromDate, row.toDate, 'h', '[]'));
        const sum = tempRows.reduce((acc, row) => {
          const key = row.status;
          const start = dayjs(row.fromDate);
          const end = dayjs(row.toDate);

          const actualStart = row.fromDate >= currentHour.toDate() ? start : currentHour;
          const actualEnd = row.toDate <= currentHour.add(1, 'h').toDate() ? end : currentHour.add(1, 'h');

          if (key in acc) {
            acc[key] = acc[key] + actualEnd.diff(actualStart, 's');
          } else {
            acc[key] = actualEnd.diff(actualStart, 's');
          }
          return acc;
        }, {});

        console.log(sum);
      }

      // const sumRows = Object.keys(groupHour).map((key) => this.calculateOee(groupHour[key], key));
      //
      // return {
      //   rows: groupHour,
      //   sumRows,
      // };
      return {};
    } else if (duration === 'daily') {
      const startCutoffDay = startDate.startOf('d').hour(cutoffHour.hour()).minute(cutoffHour.minute());
      const endCutoffDay = endDate.startOf('d').hour(cutoffHour.hour()).minute(cutoffHour.minute());
      const days = endCutoffDay.diff(startCutoffDay, 'd') + 1;

      for (let i = 0; i < days; i++) {
        const currentDay = startCutoffDay.startOf('d').add(i, 'd');
        const tempRows = rows.filter((row) => currentDay.isBetween(row.fromDate, row.toDate, 'd', '[]'));
        const sum = tempRows.reduce((acc, row) => {
          const key = row.status;
          const start = dayjs(row.fromDate);
          const end = dayjs(row.toDate);

          const actualStart = row.fromDate >= currentDay.toDate() ? start : currentDay;
          const actualEnd = row.toDate <= currentDay.add(1, 'd').toDate() ? end : currentDay.add(1, 'd');

          if (key in acc) {
            acc[key] = acc[key] + actualEnd.diff(actualStart, 's');
          } else {
            acc[key] = actualEnd.diff(actualStart, 's');
          }
          return acc;
        }, {});

        console.log(sum);
      }

      return {};

      // const sumRows = Object.keys(groupDay).map((key) => this.calculateOee(groupDay[key], key));
      //
      // return {
      //   rows: groupDay,
      //   sumRows,
      // };
    } else if (duration === 'monthly') {
      const startCutoffMonth = startDate.startOf('M').hour(cutoffHour.hour()).minute(cutoffHour.minute());
      const endCutoffMonth = endDate.startOf('M').hour(cutoffHour.hour()).minute(cutoffHour.minute());
      const months = endCutoffMonth.diff(startCutoffMonth, 'M') + 1;

      for (let i = 0; i < months; i++) {
        const currentDay = startCutoffMonth.startOf('M').add(i, 'M');
        const tempRows = rows.filter((row) => currentDay.isBetween(row.fromDate, row.toDate, 'M', '[]'));
        const sum = tempRows.reduce((acc, row) => {
          const key = row.status;
          const start = dayjs(row.fromDate);
          const end = dayjs(row.toDate);

          const actualStart = row.fromDate >= currentDay.toDate() ? start : currentDay;
          const actualEnd = row.toDate <= currentDay.add(1, 'M').toDate() ? end : currentDay.add(1, 'M');

          if (key in acc) {
            acc[key] = acc[key] + actualEnd.diff(actualStart, 's');
          } else {
            acc[key] = actualEnd.diff(actualStart, 's');
          }
          return acc;
        }, {});

        console.log(sum);
      }

      return {};

      // const sumRows = Object.keys(groupMonth).map((key) => this.calculateOee(groupMonth[key], key));
      //
      // return {
      //   rows: groupMonth,
      //   sumRows,
      // };
    } else {
      return {
        rows: [],
        sumRows: [],
      };
    }
  }

  // MC - By M/C - Bar
  // sum of days (from - to) for each of selected OEEs, Products or Lots
  // From - To
  // Multiple OEEs, Products or Lots

  async findMcByObject(
    siteId: number,
    chartType: string,
    ids: number[],
    duration: string,
    from: Date,
    to: Date,
  ): Promise<any> {
    // select oeeBatchId, status, sum(TIMESTAMPDIFF(SECOND , fromDate, toDate)) as seconds from oeeBatchStatsTimelines where oeeBatchId = 87 group by oeeBatchId, status;

    const fieldName = this.getFieldName(chartType);
    const rows = await this.analyticStatsRepository
      .createQueryBuilder()
      .where(`${fieldName} IN (:...ids)`, { ids })
      .andWhere('timestamp >= :from and timestamp <= :to', { from, to })
      .getMany();

    console.log(rows);

    if (rows.length === 0) {
      return {
        rows: [],
        sumRows: [],
      };
    }

    const group = rows.reduce((acc, item) => {
      const key = item[fieldName];
      if (key in acc) {
        acc[key].push(item);
      } else {
        acc[key] = [item];
      }
      return acc;
    }, {});

    const sumRows = [];
    for (const key of Object.keys(group)) {
      const objName = await this.getObjectName(Number(key), chartType);
      sumRows.push(await this.calculateOee(group[key], objName));
    }

    return {
      rows,
      sumRows,
    };
  }

  private calculateOee(rows: AnalyticStats[], key: any): any {
    const sumData = rows.reduce(
      (acc, row) => {
        const { data, oeeBatchId } = row;
        const {
          standardSpeedSeconds,
          runningSeconds,
          totalBreakdownSeconds,
          plannedDowntimeSeconds,
          totalCount,
          totalAutoDefects,
          totalManualDefects,
        } = data;

        const totalCountByBatch = { ...acc.totalCountByBatch };
        if (oeeBatchId in totalCountByBatch) {
          totalCountByBatch[oeeBatchId].totalCount += totalCount;
        } else {
          totalCountByBatch[oeeBatchId] = {
            standardSpeedSeconds,
            totalCount,
          };
        }

        return {
          runningSeconds: acc.runningSeconds + runningSeconds,
          totalBreakdownSeconds: acc.totalBreakdownSeconds + totalBreakdownSeconds,
          plannedDowntimeSeconds: acc.plannedDowntimeSeconds + plannedDowntimeSeconds,
          totalCount: acc.totalCount + totalCount,
          totalAutoDefects: acc.totalAutoDefects + totalAutoDefects,
          totalManualDefects: acc.totalManualDefects + totalManualDefects,
          totalCountByBatch,
        };
      },
      {
        runningSeconds: 0,
        totalBreakdownSeconds: 0,
        plannedDowntimeSeconds: 0,
        totalCount: 0,
        totalAutoDefects: 0,
        totalManualDefects: 0,
        totalCountByBatch: {},
      },
    );

    const {
      runningSeconds,
      totalBreakdownSeconds,
      plannedDowntimeSeconds,
      totalCount,
      totalAutoDefects,
      totalManualDefects,
      totalCountByBatch,
    } = sumData;

    const loadingTime = runningSeconds - plannedDowntimeSeconds;
    const nonZeroLoadingTime = loadingTime === 0 ? 1 : loadingTime;
    const operatingTime = loadingTime - totalBreakdownSeconds;

    // calculate A
    const aPercent = operatingTime / nonZeroLoadingTime;

    // calculate P
    const totalP = Object.keys(totalCountByBatch).reduce((acc, key) => {
      return totalCountByBatch[key].totalCount * totalCountByBatch[key].standardSpeedSeconds;
    }, 0);
    const pPercent = totalP / nonZeroLoadingTime;

    // calculate Q
    const totalAllDefects = totalAutoDefects + totalManualDefects;
    const nonZeroTotalCount = totalCount === 0 ? 1 : totalCount;
    const qPercent = (totalCount - totalAllDefects) / nonZeroTotalCount;

    // calculate OEE
    const oeePercent = aPercent * pPercent * qPercent;

    return {
      key,
      aPercent: aPercent * 100,
      pPercent: pPercent * 100,
      qPercent: qPercent * 100,
      oeePercent: oeePercent * 100,
    };
  }

  getFieldName(type: string) {
    switch (type) {
      case 'oee':
        return 'oeeId';

      case 'product':
        return 'productId';

      case 'batch':
        return 'oeeBatchId';
    }

    return '';
  }

  async getObjectName(id: number, type: string) {
    switch (type) {
      case 'oee':
        const oee = await this.oeeRepository.findOneBy({ id });
        return oee.productionName;

      case 'product':
        const product = await this.productRepository.findOneBy({ id });
        return `${product.name}_${product.sku}`;

      case 'batch':
        const batch = await this.oeeBatchRepository.findOneBy({ id });
        return `${batch.lotNumber}`;
    }

    return '';
  }
}
