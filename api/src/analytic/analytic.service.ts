import { Injectable } from '@nestjs/common';
import { CreateAnalyticDto } from './dto/create-analytic.dto';
import { UpdateAnalyticDto } from './dto/update-analytic.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Analytic } from '../common/entities/analytic';
import * as _ from 'lodash';
import * as dayjs from 'dayjs';
import { AnalyticStats } from '../common/entities/analytic-stats';
import { Site } from '../common/entities/site';
import { Oee } from '../common/entities/oee';
import { OeeBatch } from '../common/entities/oee-batch';
import { Product } from '../common/entities/product';
import { OeeBatchStats } from '../common/entities/oee-batch-stats';
import * as isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import * as isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import * as isBetween from 'dayjs/plugin/isBetween';
import { OeeBatchStatsTimeline } from '../common/entities/oee-batch-stats-timeline';
import { OEE_PARAM_TYPE_A, OEE_PARAM_TYPE_P, OEE_PARAM_TYPE_Q } from '../common/constant';
import { OeeBatchA } from '../common/entities/oee-batch-a';
import { MachineParameter } from '../common/entities/machine-parameter';
import { OeeBatchP } from '../common/entities/oee-batch-p';
import { OeeBatchQ } from '../common/entities/oee-batch-q';
import { AnalyticStatsParam } from '../common/entities/analytic-stats-param';
import { AnalyticAParam, AnalyticPParam, AnalyticQParam } from '../common/type/analytic-data';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);

export type ParetoData = {
  labels: string[];
  counts: number[];
  percents: number[];
};

export type ParamData = {
  labels: string[];
  counts: number[];
};

type CalculationItem = {
  key: number;
  count: number;
};

type OeeSumData = {
  runningSeconds: number;
  totalBreakdownSeconds: number;
  plannedDowntimeSeconds: number;
  totalCount: number;
  totalAutoDefects: number;
  totalManualDefects: number;
  totalOtherDefects: number;
  totalCountByBatch: {
    [key: string]: {
      standardSpeedSeconds: number;
      totalCount: number;
    };
  };
};

type StatsGroup = {
  [key: string]: AnalyticStats[];
};

type StatsParamGroup = {
  [key: string]: AnalyticStatsParam[];
};

type BatchGroup = {
  [key: number]: OeeBatch[];
};

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
    @InjectRepository(AnalyticStatsParam)
    private readonly analyticStatsParamRepository: Repository<AnalyticStatsParam>,
    @InjectRepository(OeeBatchA)
    private readonly oeeBatchARepository: Repository<OeeBatchA>,
    @InjectRepository(OeeBatchP)
    private readonly oeeBatchPRepository: Repository<OeeBatchP>,
    @InjectRepository(OeeBatchQ)
    private readonly oeeBatchQRepository: Repository<OeeBatchQ>,
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

  // OEE - By Time
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
      }, {} as StatsGroup);

      const oeeRows = Object.keys(groupHour).map((key) => this.calculateOee(this.sumOeeData(groupHour[key]), key));
      const dataRows = Object.keys(groupHour).map((key) => ({ [key]: this.sumOeeData(groupHour[key]) }));

      return {
        rows: dataRows,
        sumRows: oeeRows,
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
      const groupDay: StatsGroup = {};

      for (let i = 0; i < days; i++) {
        const startRangeDate = startSlotDay.add(i, 'd');
        const endRangeDate = startSlotDay.add(i + 1, 'd').add(-1, 's');
        const key = startSlotDay.add(i, 'd').toISOString();

        groupDay[key] = rows.filter((item) => {
          return item.timestamp >= startRangeDate.toDate() && item.timestamp <= endRangeDate.toDate();
        });
      }

      const oeeRows = Object.keys(groupDay).map((key) => this.calculateOee(this.sumOeeData(groupDay[key]), key));
      const dataRows = Object.keys(groupDay).map((key) => ({ [key]: this.sumOeeData(groupDay[key]) }));

      return {
        rows: dataRows,
        sumRows: oeeRows,
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
      const groupMonth: StatsGroup = {};

      for (let i = 0; i < months; i++) {
        const startRangeDate = startSlotMonth.add(i, 'M');
        const endRangeDate = startSlotMonth.add(i + 1, 'M').add(-1, 's');
        const key = startSlotMonth.add(i, 'M').toISOString();

        groupMonth[key] = rows.filter((item) => {
          return item.timestamp >= startRangeDate.toDate() && item.timestamp <= endRangeDate.toDate();
        });
      }

      const oeeRows = Object.keys(groupMonth).map((key) => this.calculateOee(this.sumOeeData(groupMonth[key]), key));
      const dataRows = Object.keys(groupMonth).map((key) => ({ [key]: this.sumOeeData(groupMonth[key]) }));

      return {
        rows: dataRows,
        sumRows: oeeRows,
      };
    } else {
      return {
        rows: [],
        sumRows: [],
      };
    }
  }

  // OEE - By M/C
  // sum of days (from - to) for each of selected OEEs, Products or Lots
  // From - To
  // Multiple OEEs, Products or Lots

  async findOeeByObject(siteId: number, chartType: string, ids: number[], from: Date, to: Date): Promise<any> {
    const fieldName = this.getFieldName(chartType);
    const rows = await this.analyticStatsRepository
      .createQueryBuilder()
      .where(`${fieldName} IN (:...ids)`, { ids })
      .andWhere('timestamp >= :from and timestamp <= :to', { from, to })
      .getMany();

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

    const oeeRows = [];
    for (const key of Object.keys(group)) {
      const objName = await this.getObjectName(Number(key), chartType);
      oeeRows.push(await this.calculateOee(this.sumOeeData(group[key]), objName));
    }
    const dataRows = Object.keys(group).map((key) => ({ [key]: this.sumOeeData(group[key]) }));

    return {
      rows: dataRows,
      sumRows: oeeRows,
    };
  }

  // MC - By Time
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

    const result = [];
    if (duration === 'hourly') {
      const hours = endDate.diff(startDate, 'h') + 1;

      for (let i = 0; i < hours; i++) {
        const currentHour = startDate.startOf('h').add(i, 'h');
        const tempRows = rows.filter((row) => currentHour.isBetween(row.fromDate, row.toDate, 'h', '[]'));
        result.push({
          key: currentHour.toISOString(),
          status: tempRows.reduce((acc, row) => {
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
          }, {}),
        });
      }
    } else if (duration === 'daily') {
      const startCutoffDay = startDate.startOf('d').hour(cutoffHour.hour()).minute(cutoffHour.minute());
      const endCutoffDay = endDate.startOf('d').hour(cutoffHour.hour()).minute(cutoffHour.minute());
      const days = endCutoffDay.diff(startCutoffDay, 'd') + 1;

      for (let i = 0; i < days; i++) {
        const currentDay = startCutoffDay.startOf('d').add(i, 'd');
        const tempRows = rows.filter((row) => currentDay.isBetween(row.fromDate, row.toDate, 'd', '[]'));
        result.push({
          key: currentDay.toISOString(),
          status: tempRows.reduce((acc, row) => {
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
          }, {}),
        });
      }
    } else if (duration === 'monthly') {
      const startCutoffMonth = startDate.startOf('M').hour(cutoffHour.hour()).minute(cutoffHour.minute());
      const endCutoffMonth = endDate.startOf('M').hour(cutoffHour.hour()).minute(cutoffHour.minute());
      const months = endCutoffMonth.diff(startCutoffMonth, 'M') + 1;

      for (let i = 0; i < months; i++) {
        const currentDay = startCutoffMonth.startOf('M').add(i, 'M');
        const tempRows = rows.filter((row) => currentDay.isBetween(row.fromDate, row.toDate, 'M', '[]'));
        result.push({
          key: currentDay.toISOString(),
          status: tempRows.reduce((acc, row) => {
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
          }, {}),
        });
      }
    }

    return {
      rows: [],
      sumRows: result,
    };
  }

  // MC - By M/C
  // sum of days (from - to) for each of selected OEEs, Products or Lots
  // From - To
  // Multiple OEEs, Products or Lots

  async findMcByObject(siteId: number, chartType: string, ids: number[], from: Date, to: Date): Promise<any> {
    const fieldName = this.getFieldName(chartType);
    const rows = await this.oeeBatchStatsTimelineRepository
      .createQueryBuilder()
      .where(`${fieldName} IN (:...ids)`, { ids })
      .andWhere('fromDate >= :from and toDate <= :to', { from, to })
      .getMany();

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

    const result = [];
    for (const key of Object.keys(group)) {
      const objName = await this.getObjectName(Number(key), chartType);
      result.push({
        key: objName,
        status: group[key].reduce((acc, row) => {
          const key = row.status;
          const start = dayjs(row.fromDate);
          const end = dayjs(row.toDate);

          if (key in acc) {
            acc[key] = acc[key] + end.diff(start, 's');
          } else {
            acc[key] = end.diff(start, 's');
          }
          return acc;
        }, {}),
      });
    }

    return {
      rows: [],
      sumRows: result,
    };
  }

  async findAPareto(chartType: string, ids: number[], from: Date, to: Date): Promise<any> {
    const mapping = await this.getBatchGroupByType(chartType, ids);
    const result = {};
    const keys = Object.keys(mapping);
    for (const key of keys) {
      const analyticAParams = await this.analyticStatsParamRepository
        .createQueryBuilder()
        .where(`oeeBatchId IN (:...batchIds)`, { batchIds: mapping[key].map((item) => item.id) })
        .andWhere(`paramType = :paramType`, { paramType: OEE_PARAM_TYPE_A })
        .andWhere('timestamp >= :from and timestamp <= :to', { from, to })
        .getMany();

      const mcParams = mapping[key]
        .map((item) => item.machines)
        .flat()
        .map((mc) => mc.parameters.filter((mcParam) => mcParam.oeeType === OEE_PARAM_TYPE_A))
        .flat();

      result[key] = await this.calculateParetoA(
        analyticAParams.map((item) => item.data as AnalyticAParam),
        _.uniqWith(mcParams, (pre, cur) => {
          if (pre.id == cur.id) {
            cur.name = cur.name === pre.name ? pre.name : cur.name + ' / ' + pre.name;
            return true;
          }
          return false;
        }),
      );
    }

    return {
      rows: [],
      sumRows: result,
    };
  }

  async findPPareto(chartType: string, ids: number[], from: Date, to: Date): Promise<any> {
    const mapping = await this.getBatchGroupByType(chartType, ids);
    const result = {};
    const keys = Object.keys(mapping);
    for (const key of keys) {
      const analyticPParams = await this.analyticStatsParamRepository
        .createQueryBuilder()
        .where(`oeeBatchId IN (:...batchIds)`, { batchIds: mapping[key].map((item) => item.id) })
        .andWhere(`paramType = :paramType`, { paramType: OEE_PARAM_TYPE_P })
        .andWhere('timestamp >= :from and timestamp <= :to', { from, to })
        .getMany();

      const mcParams = mapping[key]
        .map((item) => item.machines)
        .flat()
        .map((mc) => mc.parameters.filter((mcParam) => mcParam.oeeType === OEE_PARAM_TYPE_P))
        .flat();

      result[key] = await this.calculateParetoP(
        analyticPParams.map((item) => item.data as AnalyticPParam),
        _.uniqWith(mcParams, (pre, cur) => {
          if (pre.id == cur.id) {
            cur.name = cur.name === pre.name ? pre.name : cur.name + ' / ' + pre.name;
            return true;
          }
          return false;
        }),
      );
    }

    return {
      rows: [],
      sumRows: result,
    };
  }

  async findQPareto(chartType: string, ids: number[], from: Date, to: Date): Promise<any> {
    const mapping = await this.getBatchGroupByType(chartType, ids);
    const result = {};
    const keys = Object.keys(mapping);
    for (const key of keys) {
      const analyticQParams = await this.analyticStatsParamRepository
        .createQueryBuilder()
        .where(`oeeBatchId IN (:...batchIds)`, { batchIds: mapping[key].map((item) => item.id) })
        .andWhere(`paramType = :paramType`, { paramType: OEE_PARAM_TYPE_Q })
        .andWhere('timestamp >= :from and timestamp <= :to', { from, to })
        .getMany();

      const mcParams = mapping[key]
        .map((item) => item.machines)
        .flat()
        .map((mc) => mc.parameters.filter((mcParam) => mcParam.oeeType === OEE_PARAM_TYPE_Q))
        .flat();

      result[key] = await this.calculateParetoQ(
        analyticQParams.map((item) => item.data as AnalyticQParam),
        _.uniqWith(mcParams, (pre, cur) => {
          if (pre.id == cur.id) {
            cur.name = cur.name === pre.name ? pre.name : cur.name + ' / ' + pre.name;
            return true;
          }
          return false;
        }),
      );
    }

    return {
      rows: [],
      sumRows: result,
    };
  }

  async findAParams(
    siteId: number,
    chartType: string,
    ids: number[],
    duration: string,
    from: Date,
    to: Date,
  ): Promise<any> {
    const fieldName = this.getFieldName(chartType);
    const rows = await this.analyticStatsParamRepository
      .createQueryBuilder()
      .where(`${fieldName} IN (:...ids)`, { ids })
      .andWhere(`paramType = :paramType`, { paramType: OEE_PARAM_TYPE_A })
      .andWhere('timestamp >= :from and timestamp <= :to', { from, to })
      .getMany();

    if (rows.length === 0) {
      return {
        rows: [],
        sumRows: [],
      };
    }

    const batchIds = rows.reduce((acc, row) => {
      if (acc.indexOf(row.oeeBatchId) < 0) {
        acc.push(row.oeeBatchId);
      }
      return acc;
    }, []);

    if (batchIds.length === 0) {
      return {
        rows: [],
        sumRows: [],
      };
    }

    const batches = await this.oeeBatchRepository
      .createQueryBuilder()
      .where(`id IN (:...ids)`, { ids: batchIds })
      .getMany();

    const paramFromAllMc = batches
      .map((item) => item.machines)
      .flat()
      .map((mc) => mc.parameters.filter((mcParam) => mcParam.oeeType === OEE_PARAM_TYPE_A))
      .flat();

    const mcParams = _.uniqWith(paramFromAllMc, (pre, cur) => {
      if (pre.id == cur.id) {
        cur.name = cur.name === pre.name ? pre.name : cur.name + ' / ' + pre.name;
        return true;
      }
      return false;
    });

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
      }, {} as StatsParamGroup);

      const paramRows = Object.keys(groupHour).map((key) => ({
        key: key,
        data: this.sumAParamData(
          groupHour[key].map((item) => item.data as AnalyticAParam),
          mcParams,
        ),
      }));
      const dataRows = [];
      // const dataRows = Object.keys(groupHour).map((key) => ({ [key]: this.sumOeeData(groupHour[key]) }));

      return {
        rows: dataRows,
        sumRows: paramRows,
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
      const groupDay: StatsParamGroup = {};

      for (let i = 0; i < days; i++) {
        const startRangeDate = startSlotDay.add(i, 'd');
        const endRangeDate = startSlotDay.add(i + 1, 'd').add(-1, 's');
        const key = startSlotDay.add(i, 'd').toISOString();

        groupDay[key] = rows.filter((item) => {
          return item.timestamp >= startRangeDate.toDate() && item.timestamp <= endRangeDate.toDate();
        });
      }

      const paramRows = Object.keys(groupDay).map((key) => ({
        key: key,
        data: this.sumAParamData(
          groupDay[key].map((item) => item.data as AnalyticAParam),
          mcParams,
        ),
      }));
      const dataRows = [];
      // const dataRows = Object.keys(groupDay).map((key) => ({ [key]: this.sumOeeData(groupDay[key]) }));

      return {
        rows: dataRows,
        sumRows: paramRows,
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
      const groupMonth: StatsParamGroup = {};

      for (let i = 0; i < months; i++) {
        const startRangeDate = startSlotMonth.add(i, 'M');
        const endRangeDate = startSlotMonth.add(i + 1, 'M').add(-1, 's');
        const key = startSlotMonth.add(i, 'M').toISOString();

        groupMonth[key] = rows.filter((item) => {
          return item.timestamp >= startRangeDate.toDate() && item.timestamp <= endRangeDate.toDate();
        });
      }

      const paramRows = Object.keys(groupMonth).map((key) => ({
        key: key,
        data: this.sumAParamData(
          groupMonth[key].map((item) => item.data as AnalyticAParam),
          mcParams,
        ),
      }));
      const dataRows = [];
      // const dataRows = Object.keys(groupMonth).map((key) => ({ [key]: this.sumOeeData(groupMonth[key]) }));

      return {
        rows: dataRows,
        sumRows: paramRows,
      };
    } else {
      return {
        rows: [],
        sumRows: [],
      };
    }
  }

  async findPParams(
    siteId: number,
    chartType: string,
    ids: number[],
    duration: string,
    from: Date,
    to: Date,
  ): Promise<any> {
    const fieldName = this.getFieldName(chartType);
    const rows = await this.analyticStatsParamRepository
      .createQueryBuilder()
      .where(`${fieldName} IN (:...ids)`, { ids })
      .andWhere(`paramType = :paramType`, { paramType: OEE_PARAM_TYPE_P })
      .andWhere('timestamp >= :from and timestamp <= :to', { from, to })
      .getMany();

    if (rows.length === 0) {
      return {
        rows: [],
        sumRows: [],
      };
    }

    const batchIds = rows.reduce((acc, row) => {
      if (acc.indexOf(row.oeeBatchId) < 0) {
        acc.push(row.oeeBatchId);
      }
      return acc;
    }, []);

    if (batchIds.length === 0) {
      return {
        rows: [],
        sumRows: [],
      };
    }

    const batches = await this.oeeBatchRepository
      .createQueryBuilder()
      .where(`id IN (:...ids)`, { ids: batchIds })
      .getMany();

    const paramFromAllMc = batches
      .map((item) => item.machines)
      .flat()
      .map((mc) => mc.parameters.filter((mcParam) => mcParam.oeeType === OEE_PARAM_TYPE_P))
      .flat();

    const mcParams = _.uniqWith(paramFromAllMc, (pre, cur) => {
      if (pre.id == cur.id) {
        cur.name = cur.name === pre.name ? pre.name : cur.name + ' / ' + pre.name;
        return true;
      }
      return false;
    });

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
      }, {} as StatsParamGroup);

      const paramRows = Object.keys(groupHour).map((key) => ({
        key: key,
        data: this.sumPParamData(
          groupHour[key].map((item) => item.data as AnalyticPParam),
          mcParams,
        ),
      }));

      const dataRows = [];
      // const dataRows = Object.keys(groupHour).map((key) => ({ [key]: this.sumOeeData(groupHour[key]) }));

      return {
        rows: dataRows,
        sumRows: paramRows,
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
      const groupDay: StatsParamGroup = {};

      for (let i = 0; i < days; i++) {
        const startRangeDate = startSlotDay.add(i, 'd');
        const endRangeDate = startSlotDay.add(i + 1, 'd').add(-1, 's');
        const key = startSlotDay.add(i, 'd').toISOString();

        groupDay[key] = rows.filter((item) => {
          return item.timestamp >= startRangeDate.toDate() && item.timestamp <= endRangeDate.toDate();
        });
      }

      const paramRows = Object.keys(groupDay).map((key) => ({
        key: key,
        data: this.sumPParamData(
          groupDay[key].map((item) => item.data as AnalyticPParam),
          mcParams,
        ),
      }));
      const dataRows = [];
      // const dataRows = Object.keys(groupDay).map((key) => ({ [key]: this.sumOeeData(groupDay[key]) }));

      return {
        rows: dataRows,
        sumRows: paramRows,
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
      const groupMonth: StatsParamGroup = {};

      for (let i = 0; i < months; i++) {
        const startRangeDate = startSlotMonth.add(i, 'M');
        const endRangeDate = startSlotMonth.add(i + 1, 'M').add(-1, 's');
        const key = startSlotMonth.add(i, 'M').toISOString();

        groupMonth[key] = rows.filter((item) => {
          return item.timestamp >= startRangeDate.toDate() && item.timestamp <= endRangeDate.toDate();
        });
      }

      const paramRows = Object.keys(groupMonth).map((key) => ({
        key: key,
        data: this.sumPParamData(
          groupMonth[key].map((item) => item.data as AnalyticPParam),
          mcParams,
        ),
      }));
      const dataRows = [];
      // const dataRows = Object.keys(groupMonth).map((key) => ({ [key]: this.sumOeeData(groupMonth[key]) }));

      return {
        rows: dataRows,
        sumRows: paramRows,
      };
    } else {
      return {
        rows: [],
        sumRows: [],
      };
    }
  }

  async findQParams(
    siteId: number,
    chartType: string,
    ids: number[],
    duration: string,
    from: Date,
    to: Date,
  ): Promise<any> {
    const fieldName = this.getFieldName(chartType);
    const rows = await this.analyticStatsParamRepository
      .createQueryBuilder()
      .where(`${fieldName} IN (:...ids)`, { ids })
      .andWhere(`paramType = :paramType`, { paramType: OEE_PARAM_TYPE_Q })
      .andWhere('timestamp >= :from and timestamp <= :to', { from, to })
      .getMany();

    if (rows.length === 0) {
      return {
        rows: [],
        sumRows: [],
      };
    }

    const batchIds = rows.reduce((acc, row) => {
      if (acc.indexOf(row.oeeBatchId) < 0) {
        acc.push(row.oeeBatchId);
      }
      return acc;
    }, []);

    if (batchIds.length === 0) {
      return {
        rows: [],
        sumRows: [],
      };
    }

    const batches = await this.oeeBatchRepository
      .createQueryBuilder()
      .where(`id IN (:...ids)`, { ids: batchIds })
      .getMany();

    const paramFromAllMc = batches
      .map((item) => item.machines)
      .flat()
      .map((mc) => mc.parameters.filter((mcParam) => mcParam.oeeType === OEE_PARAM_TYPE_Q))
      .flat();

    const mcParams = _.uniqWith(paramFromAllMc, (pre, cur) => {
      if (pre.id == cur.id) {
        cur.name = cur.name === pre.name ? pre.name : cur.name + ' / ' + pre.name;
        return true;
      }
      return false;
    });

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
      }, {} as StatsParamGroup);

      const paramRows = Object.keys(groupHour).map((key) => ({
        key: key,
        data: this.sumQParamData(
          groupHour[key].map((item) => item.data as AnalyticQParam),
          mcParams,
        ),
      }));

      const dataRows = [];
      // const dataRows = Object.keys(groupHour).map((key) => ({ [key]: this.sumOeeData(groupHour[key]) }));

      return {
        rows: dataRows,
        sumRows: paramRows,
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
      const groupDay: StatsParamGroup = {};

      for (let i = 0; i < days; i++) {
        const startRangeDate = startSlotDay.add(i, 'd');
        const endRangeDate = startSlotDay.add(i + 1, 'd').add(-1, 's');
        const key = startSlotDay.add(i, 'd').toISOString();

        groupDay[key] = rows.filter((item) => {
          return item.timestamp >= startRangeDate.toDate() && item.timestamp <= endRangeDate.toDate();
        });
      }

      const paramRows = Object.keys(groupDay).map((key) => ({
        key: key,
        data: this.sumQParamData(
          groupDay[key].map((item) => item.data as AnalyticQParam),
          mcParams,
        ),
      }));
      const dataRows = [];
      // const dataRows = Object.keys(groupDay).map((key) => ({ [key]: this.sumOeeData(groupDay[key]) }));

      return {
        rows: dataRows,
        sumRows: paramRows,
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
      const groupMonth: StatsParamGroup = {};

      for (let i = 0; i < months; i++) {
        const startRangeDate = startSlotMonth.add(i, 'M');
        const endRangeDate = startSlotMonth.add(i + 1, 'M').add(-1, 's');
        const key = startSlotMonth.add(i, 'M').toISOString();

        groupMonth[key] = rows.filter((item) => {
          return item.timestamp >= startRangeDate.toDate() && item.timestamp <= endRangeDate.toDate();
        });
      }

      const paramRows = Object.keys(groupMonth).map((key) => ({
        key: key,
        data: this.sumQParamData(
          groupMonth[key].map((item) => item.data as AnalyticQParam),
          mcParams,
        ),
      }));
      const dataRows = [];
      // const dataRows = Object.keys(groupMonth).map((key) => ({ [key]: this.sumOeeData(groupMonth[key]) }));

      return {
        rows: dataRows,
        sumRows: paramRows,
      };
    } else {
      return {
        rows: [],
        sumRows: [],
      };
    }
  }

  private async getBatchGroupByType(type: string, ids: number[]): Promise<BatchGroup> {
    if (type === 'oee') {
      const batches = await this.oeeBatchRepository.createQueryBuilder().where(`oeeId IN (:...ids)`, { ids }).getMany();
      return batches.reduce((acc, item) => {
        const key = item.oeeId;
        if (key in acc) {
          acc[key].push(item);
        } else {
          acc[key] = [item];
        }
        return acc;
      }, {});
    } else if (type === 'product') {
      const batches = await this.oeeBatchRepository
        .createQueryBuilder()
        .where(`JSON_EXTRACT(product, "$.id") IN (:...ids)`, { ids })
        .getMany();
      return batches.reduce((acc, item) => {
        const key = item.product.id;
        if (key in acc) {
          acc[key].push(item);
        } else {
          acc[key] = [item];
        }
        return acc;
      }, {});
    } else if (type === 'batch') {
      const batches = await this.oeeBatchRepository.createQueryBuilder().where(`id IN (:...ids)`, { ids }).getMany();
      return batches.reduce((acc, item) => {
        const key = item.id;
        if (key in acc) {
          acc[key].push(item);
        } else {
          acc[key] = [item];
        }
        return acc;
      }, {});
    }

    return {};
  }

  private sumOeeData(rows: AnalyticStats[]): OeeSumData {
    const initSum: OeeSumData = {
      runningSeconds: 0,
      totalBreakdownSeconds: 0,
      plannedDowntimeSeconds: 0,
      totalCount: 0,
      totalAutoDefects: 0,
      totalManualDefects: 0,
      totalOtherDefects: 0,
      totalCountByBatch: {},
    };

    return rows.reduce((acc, row) => {
      const { data, oeeBatchId } = row;
      const {
        standardSpeedSeconds,
        runningSeconds,
        totalBreakdownSeconds,
        plannedDowntimeSeconds,
        totalCount,
        totalAutoDefects,
        totalManualDefects,
        totalOtherDefects,
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
        totalOtherDefects: acc.totalOtherDefects + totalOtherDefects,
        totalCountByBatch,
      };
    }, initSum);
  }

  private calculateOee(sumData: OeeSumData, key: string): any {
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

  private async calculateParetoA(aParams: AnalyticAParam[], mcParams: MachineParameter[]): Promise<ParetoData> {
    const total = aParams.reduce((acc, item) => acc + item.seconds, 0);
    const list = aParams.reduce((acc, item) => {
      const idx = acc.findIndex((i) => i.key === (item.machineParameterId || 0));
      if (idx < 0) {
        acc.push({
          key: item.machineParameterId || 0,
          count: item.seconds,
        });
        return acc;
      }

      acc[idx].count = acc[idx].count + item.seconds;
      return acc;
    }, [] as CalculationItem[]);

    if (list.length === 0) {
      return;
    }

    const listWithoutOther = list.filter((item) => item.key !== 0);
    const sortedList = listWithoutOther.sort((a, b) => (b.count > a.count ? 1 : a.count > b.count ? -1 : 0));
    const listFirstNine = sortedList.slice(0, 9);
    const restOfTheList = sortedList.slice(9, sortedList.length);

    // const params = machines.map((mc) => mc.parameters.filter((mcParam) => mcParam.oeeType === OEE_PARAM_TYPE_A)).flat();
    const labels = listFirstNine.map((item) => mcParams.filter((param) => param.id === item.key)[0].name);
    labels.push('Other');

    const finalList = [...listFirstNine];
    const otherList = list.filter((item) => item.key === 0);
    if (otherList.length > 0) {
      const itemOther = list.filter((item) => item.key === 0)[0];
      itemOther.count = itemOther.count + restOfTheList.reduce((sum, item) => sum + item.count, 0);
      finalList.push(itemOther);
    }

    const counts: number[] = finalList.map((item) => item.count);
    const percents: number[] = finalList.map((item, idx, arr) => {
      const sum = arr.slice(0, idx + 1).reduce((sum, item) => sum + item.count, 0);
      return (sum / total) * 100;
    });

    return {
      labels,
      counts,
      percents,
    };
  }

  private async calculateParetoP(pParams: AnalyticPParam[], mcParams: MachineParameter[]): Promise<ParetoData> {
    const total = pParams.reduce((acc, item) => acc + item.seconds, 0);
    const list = pParams.reduce((acc, item) => {
      const idx = acc.findIndex((i) => i.key === (item.machineParameterId || 0));
      if (idx < 0) {
        acc.push({
          key: item.machineParameterId || 0,
          count: item.seconds,
        });
        return acc;
      }

      acc[idx].count = acc[idx].count + item.seconds;
      return acc;
    }, [] as CalculationItem[]);

    if (list.length === 0) {
      return;
    }

    const listWithoutOther = list.filter((item) => item.key !== 0);
    const sortedList = listWithoutOther.sort((a, b) => (b.count > a.count ? 1 : a.count > b.count ? -1 : 0));
    const listFirstNine = sortedList.slice(0, 9);
    const restOfTheList = sortedList.slice(9, sortedList.length);

    const labels = listFirstNine.map((item) => mcParams.filter((param) => param.id === item.key)[0].name);
    labels.push('Other');

    const finalList = [...listFirstNine];
    const otherList = list.filter((item) => item.key === 0);
    if (otherList.length > 0) {
      const itemOther = list.filter((item) => item.key === 0)[0];
      itemOther.count = itemOther.count + restOfTheList.reduce((sum, item) => sum + item.count, 0);
      finalList.push(itemOther);
    }

    const counts: number[] = finalList.map((item) => item.count);
    const percents: number[] = finalList.map((item, idx, arr) => {
      const sum = arr.slice(0, idx + 1).reduce((sum, item) => sum + item.count, 0);
      return (sum / total) * 100;
    });

    return {
      labels,
      counts,
      percents,
    };
  }

  private async calculateParetoQ(qParams: AnalyticQParam[], mcParams: MachineParameter[]): Promise<ParetoData> {
    const total = qParams.reduce((acc, item) => acc + item.autoAmount + item.manualAmount, 0);
    const list = qParams.reduce((acc, item) => {
      const idx = acc.findIndex((i) => i.key === (item.machineParameterId || 0));
      if (idx < 0) {
        acc.push({
          key: item.machineParameterId || 0,
          count: item.autoAmount + item.manualAmount,
        });
        return acc;
      }

      acc[idx].count = acc[idx].count + item.autoAmount + item.manualAmount;
      return acc;
    }, [] as CalculationItem[]);

    if (list.length === 0) {
      return;
    }

    const listWithoutOther = list.filter((item) => item.key !== 0);
    const sortedList = listWithoutOther.sort((a, b) => (b.count > a.count ? 1 : a.count > b.count ? -1 : 0));
    const listFirstNine = sortedList.slice(0, 9);
    const restOfTheList = sortedList.slice(9, sortedList.length);

    const labels = listFirstNine.map((item) => mcParams.filter((param) => param.id === item.key)[0].name);
    labels.push('Other');

    const finalList = [...listFirstNine];
    const otherList = list.filter((item) => item.key === 0);
    if (otherList.length > 0) {
      const itemOther = list.filter((item) => item.key === 0)[0];
      itemOther.count = itemOther.count + restOfTheList.reduce((sum, item) => sum + item.count, 0);
      finalList.push(itemOther);
    }

    const counts: number[] = finalList.map((item) => item.count);
    const percents: number[] = finalList.map((item, idx, arr) => {
      const sum = arr.slice(0, idx + 1).reduce((sum, item) => sum + item.count, 0);
      return (sum / total) * 100;
    });

    return {
      labels,
      counts,
      percents,
    };
  }

  private sumAParamData(aParams: AnalyticAParam[], mcParams: MachineParameter[]): ParamData {
    const list = aParams.reduce((acc, item) => {
      const idx = acc.findIndex((i) => i.key === (item.machineParameterId || 0));
      if (idx < 0) {
        acc.push({
          key: item.machineParameterId || 0,
          count: item.seconds,
        });
        return acc;
      }

      acc[idx].count = acc[idx].count + item.seconds;
      return acc;
    }, [] as CalculationItem[]);

    if (list.length === 0) {
      return;
    }

    const listWithoutOther = list.filter((item) => item.key !== 0);
    const sortedList = listWithoutOther.sort((a, b) => (b.count > a.count ? 1 : a.count > b.count ? -1 : 0));
    const listFirstNine = sortedList.slice(0, 9);
    const restOfTheList = sortedList.slice(9, sortedList.length);

    const labels = listFirstNine.map((item) => mcParams.filter((param) => param.id === item.key)[0].name);
    const finalList = [...listFirstNine];
    const otherList = list.filter((item) => item.key === 0);
    if (otherList.length > 0) {
      const itemOther = list.filter((item) => item.key === 0)[0];
      itemOther.count = itemOther.count + restOfTheList.reduce((sum, item) => sum + item.count, 0);
      labels.push('Other');
      finalList.push(itemOther);
    }

    const counts: number[] = finalList.map((item) => item.count);

    return {
      labels,
      counts,
    };
  }

  private sumPParamData(pParams: AnalyticPParam[], mcParams: MachineParameter[]): ParamData {
    const list = pParams.reduce((acc, item) => {
      const idx = acc.findIndex((i) => i.key === (item.machineParameterId || 0));
      if (idx < 0) {
        acc.push({
          key: item.machineParameterId || 0,
          count: item.seconds,
        });
        return acc;
      }

      acc[idx].count = acc[idx].count + item.seconds;
      return acc;
    }, [] as CalculationItem[]);

    if (list.length === 0) {
      return;
    }

    const listWithoutOther = list.filter((item) => item.key !== 0);
    const sortedList = listWithoutOther.sort((a, b) => (b.count > a.count ? 1 : a.count > b.count ? -1 : 0));
    const listFirstNine = sortedList.slice(0, 9);
    const restOfTheList = sortedList.slice(9, sortedList.length);

    const labels = listFirstNine.map((item) => mcParams.filter((param) => param.id === item.key)[0].name);

    const finalList = [...listFirstNine];
    const otherList = list.filter((item) => item.key === 0);
    if (otherList.length > 0) {
      const itemOther = list.filter((item) => item.key === 0)[0];
      itemOther.count = itemOther.count + restOfTheList.reduce((sum, item) => sum + item.count, 0);
      labels.push('Other');
      finalList.push(itemOther);
    }

    const counts: number[] = finalList.map((item) => item.count);

    return {
      labels,
      counts,
    };
  }

  private sumQParamData(qParams: AnalyticQParam[], mcParams: MachineParameter[]): ParamData {
    const list = qParams.reduce((acc, item) => {
      const idx = acc.findIndex((i) => i.key === (item.machineParameterId || 0));
      if (idx < 0) {
        acc.push({
          key: item.machineParameterId || 0,
          count: item.manualAmount + item.autoAmount,
        });
        return acc;
      }

      acc[idx].count = acc[idx].count + item.manualAmount + item.autoAmount;
      return acc;
    }, [] as CalculationItem[]);

    if (list.length === 0) {
      return;
    }

    const listWithoutOther = list.filter((item) => item.key !== 0);
    const sortedList = listWithoutOther.sort((a, b) => (b.count > a.count ? 1 : a.count > b.count ? -1 : 0));
    const listFirstNine = sortedList.slice(0, 9);
    const restOfTheList = sortedList.slice(9, sortedList.length);

    const labels = listFirstNine.map((item) => mcParams.filter((param) => param.id === item.key)[0].name);

    const finalList = [...listFirstNine];
    const otherList = list.filter((item) => item.key === 0);
    if (otherList.length > 0) {
      const itemOther = list.filter((item) => item.key === 0)[0];
      itemOther.count = itemOther.count + restOfTheList.reduce((sum, item) => sum + item.count, 0);
      labels.push('Other');
      finalList.push(itemOther);
    }

    const counts: number[] = finalList.map((item) => item.count);

    return {
      labels,
      counts,
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
