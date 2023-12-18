import { Injectable } from '@nestjs/common';
import { CreateAnalyticDto } from './dto/create-analytic.dto';
import { UpdateAnalyticDto } from './dto/update-analytic.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { AnalyticEntity } from '../common/entities/analytic.entity';
import * as _ from 'lodash';
import * as dayjs from 'dayjs';
import { ManipulateType, OpUnitType } from 'dayjs';
import { SiteEntity } from '../common/entities/site.entity';
import { OeeEntity } from '../common/entities/oee.entity';
import { OeeBatchEntity } from '../common/entities/oee-batch.entity';
import { ProductEntity } from '../common/entities/product.entity';
import { OeeBatchStatsEntity } from '../common/entities/oee-batch-stats.entity';
import * as isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import * as isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import * as isBetween from 'dayjs/plugin/isBetween';
import { OeeBatchStatsTimelineEntity } from '../common/entities/oee-batch-stats-timeline.entity';
import { OEE_PARAM_TYPE_A, OEE_PARAM_TYPE_P, OEE_PARAM_TYPE_Q } from '../common/constant';
import { OeeBatchAEntity } from '../common/entities/oee-batch-a.entity';
import { MachineParameterEntity } from '../common/entities/machine-parameter.entity';
import { OeeBatchPEntity } from '../common/entities/oee-batch-p.entity';
import { OeeBatchQEntity } from '../common/entities/oee-batch-q.entity';
import { AnalyticStatsParamEntity } from '../common/entities/analytic-stats-param.entity';
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
  name: string;
  runningSeconds: number;
  operatingSeconds: number;
  totalBreakdownSeconds: number;
  plannedDowntimeSeconds: number;
  machineSetupSeconds: number;
  totalCount: number;
  totalAutoDefects: number;
  totalManualDefects: number;
  totalOtherDefects: number;
  totalCountByBatch: {
    [key: string]: {
      lotNumber: string;
      standardSpeedSeconds: number;
      totalCount: number;
    };
  };
};

type StatsParamGroup = {
  [key: string]: AnalyticStatsParamEntity[];
};

type BatchGroup = {
  [key: number]: OeeBatchEntity[];
};

@Injectable()
export class AnalyticService {
  constructor(
    @InjectRepository(SiteEntity)
    private readonly siteRepository: Repository<SiteEntity>,
    @InjectRepository(OeeEntity)
    private readonly oeeRepository: Repository<OeeEntity>,
    @InjectRepository(OeeBatchEntity)
    private readonly oeeBatchRepository: Repository<OeeBatchEntity>,
    @InjectRepository(OeeBatchStatsEntity)
    private readonly oeeBatchStatsRepository: Repository<OeeBatchStatsEntity>,
    @InjectRepository(OeeBatchStatsTimelineEntity)
    private readonly oeeBatchStatsTimelineRepository: Repository<OeeBatchStatsTimelineEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(AnalyticEntity)
    private readonly analyticRepository: Repository<AnalyticEntity>,
    @InjectRepository(AnalyticStatsParamEntity)
    private readonly analyticStatsParamRepository: Repository<AnalyticStatsParamEntity>,
    @InjectRepository(OeeBatchAEntity)
    private readonly oeeBatchARepository: Repository<OeeBatchAEntity>,
    @InjectRepository(OeeBatchPEntity)
    private readonly oeeBatchPRepository: Repository<OeeBatchPEntity>,
    @InjectRepository(OeeBatchQEntity)
    private readonly oeeBatchQRepository: Repository<OeeBatchQEntity>,
    private readonly entityManager: EntityManager,
  ) {}

  findAll(group: boolean, siteId: number): Promise<AnalyticEntity[]> {
    return this.analyticRepository.findBy({ siteId, group });
  }

  findById(id: number, siteId: number): Promise<AnalyticEntity> {
    return this.analyticRepository.findOneBy({ id, siteId });
  }

  create(createDto: CreateAnalyticDto, siteId: number): Promise<AnalyticEntity> {
    return this.analyticRepository.save({
      ...createDto,
      siteId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(id: number, updateDto: UpdateAnalyticDto, siteId: number): Promise<AnalyticEntity> {
    const updatingAnalytic = await this.analyticRepository.findOneBy({ id, siteId });
    return this.analyticRepository.save({
      ..._.assign(updatingAnalytic, updateDto),
      updatedAt: new Date(),
    });
  }

  async delete(id: number, siteId: number): Promise<void> {
    const analytic = await this.analyticRepository.findOneBy({ id, siteId });
    await this.analyticRepository.remove(analytic);
  }

  private async getOeeStatsByTime(
    ids: number[],
    duration: string,
    from: Date,
    to: Date,
    fieldName: string,
    cutoffHour: string,
  ): Promise<any[]> {
    let rows = [];

    if (duration === 'hourly') {
      const query =
        'select a.id, a.data, a.oeeId, a.oeeBatchId, a.productId, a.timestamp, b.timeslot\n' +
        'from oeeBatchStats a\n' +
        '         inner join (select max(id)                                                            as id,\n' +
        '                            oeeBatchId,\n' +
        '                            (timestamp - interval MOD(UNIX_TIMESTAMP(timestamp), 3600) second) as timeslot\n' +
        '                     from oeeBatchStats\n' +
        `                     where ${fieldName} in (${ids.join(', ')})\n` +
        `                       and timestamp >= ?\n` +
        `                       and timestamp <= ?\n` +
        '                     group by oeeBatchId, timeslot) b\n' +
        '                    on a.id = b.id\n' +
        `where a.${fieldName} in (${ids.join(', ')})\n` +
        'order by a.timestamp, a.oeeBatchId;';

      const minus1HourFrom = dayjs(from).add(-1, 'h').startOf('h').toDate();
      rows = await this.entityManager.query(query, [minus1HourFrom, to]);
    } else if (duration === 'daily' || duration === 'monthly') {
      if (duration === 'daily') {
        const query =
          'select a.id, a.data, a.oeeId, a.oeeBatchId, a.productId, a.timestamp, c.startOfDay as timeslot\n' +
          'from oeeBatchStats a\n' +
          '         inner join (select max(b.id) as id,\n' +
          '                            b.oeeBatchId,\n' +
          '                            c.startOfDay,\n' +
          '                            c.endOfDay\n' +
          '                     from oeeBatchStats b\n' +
          '                              inner join (select oeeBatchId,\n' +
          `                                                 CAST(DATE_FORMAT(timestamp, '%Y-%m-%d ${cutoffHour}') as datetime)                           as startOfDay,\n` +
          `                                                 CAST(DATE_FORMAT(DATE_ADD(timestamp, interval 1 day), '%Y-%m-%d ${cutoffHour}') as datetime) as endOfDay\n` +
          '                                          from oeeBatchStats\n' +
          `                                          where ${fieldName} in (${ids.join(', ')})\n` +
          `                                            and timestamp >= ?\n` +
          `                                            and timestamp <= ?\n` +
          '                                          group by oeeBatchId, startOfDay, endOfDay) c\n' +
          '                                         on b.oeeBatchId = c.oeeBatchId and\n' +
          '                                            b.timestamp between c.startOfDay and c.endOfDay\n' +
          `                     where b.${fieldName} in (${ids.join(', ')})\n` +
          `                       and b.timestamp >= ?\n` +
          `                       and b.timestamp <= ?\n` +
          '                     group by b.oeeBatchId, c.startOfDay, c.endOfDay) c on a.id = c.id\n' +
          `where a.${fieldName} in (${ids.join(', ')})\n` +
          'order by a.timestamp, a.oeeBatchId;';

        const minus1DayFrom = dayjs(from).add(-1, 'd').startOf('d').toDate();
        rows = await this.entityManager.query(query, [minus1DayFrom, to, minus1DayFrom, to]);
      } else if (duration === 'monthly') {
        const query =
          'select a.id, a.data, a.oeeId, a.oeeBatchId, a.productId, a.timestamp, c.startOfDay as timeslot\n' +
          'from oeeBatchStats a\n' +
          '         inner join (select max(b.id) as id,\n' +
          '                            b.oeeBatchId,\n' +
          '                            c.startOfDay,\n' +
          '                            c.endOfDay\n' +
          '                     from oeeBatchStats b\n' +
          '                              inner join (select oeeBatchId,\n' +
          `                                                 CAST(DATE_FORMAT(timestamp, '%Y-%m-01 ${cutoffHour}') as datetime)                           as startOfDay,\n` +
          `                                                 CAST(DATE_FORMAT(last_day(timestamp), '%Y-%m-%d ${cutoffHour}') as datetime) as endOfDay\n` +
          '                                          from oeeBatchStats\n' +
          `                                          where ${fieldName} in (${ids.join(', ')})\n` +
          `                                            and timestamp >= ?\n` +
          `                                            and timestamp <= ?\n` +
          '                                          group by oeeBatchId, startOfDay, endOfDay) c\n' +
          '                                         on b.oeeBatchId = c.oeeBatchId and\n' +
          '                                            b.timestamp between c.startOfDay and c.endOfDay\n' +
          `                     where b.${fieldName} in (${ids.join(', ')})\n` +
          `                       and b.timestamp >= ?\n` +
          `                       and b.timestamp <= ?\n` +
          '                     group by b.oeeBatchId, c.startOfDay, c.endOfDay) c on a.id = c.id\n' +
          `where a.${fieldName} in (${ids.join(', ')})\n` +
          'order by a.timestamp, a.oeeBatchId;';

        const minus1MonthFrom = dayjs(from).add(-1, 'M').startOf('M').toDate();
        rows = await this.entityManager.query(query, [minus1MonthFrom, to, minus1MonthFrom, to]);
      }
    }

    let previousItem: any = {};
    const newRows = [];

    for (const row of rows) {
      if (row.oeeBatchId === previousItem.batchId) {
        const previous = rows.find((item) => item.id === previousItem.id);
        const { data: previousData } = previous;
        const { data: currentData } = row;

        newRows.push({
          ...row,
          data: {
            ...currentData,
            totalCount: currentData.totalCount - previousData.totalCount,
            runningSeconds: currentData.runningSeconds - previousData.runningSeconds,
            operatingSeconds: currentData.operatingSeconds - previousData.operatingSeconds,
            totalAutoDefects: currentData.totalAutoDefects - previousData.totalAutoDefects,
            totalStopSeconds: currentData.totalStopSeconds - previousData.totalStopSeconds,
            totalOtherDefects: currentData.totalOtherDefects - previousData.totalOtherDefects,
            totalManualDefects: currentData.totalManualDefects - previousData.totalManualDefects,
            machineSetupSeconds: currentData.machineSetupSeconds - previousData.machineSetupSeconds,
            totalBreakdownSeconds: currentData.totalBreakdownSeconds - previousData.totalBreakdownSeconds,
            totalMinorStopSeconds: currentData.totalMinorStopSeconds - previousData.totalMinorStopSeconds,
            totalSpeedLossSeconds: currentData.totalSpeedLossSeconds - previousData.totalSpeedLossSeconds,
            plannedDowntimeSeconds: currentData.plannedDowntimeSeconds - previousData.plannedDowntimeSeconds,
          },
        });
      } else {
        newRows.push(row);
      }

      previousItem = { id: row.id, batchId: row.oeeBatchId };
    }

    return newRows.filter((item) => dayjs(item.timeslot).isSameOrAfter(from));
  }

  // OEE - By Time
  // day or sum of days in month for a OEE, Product or Lot
  // From - To
  // Single OEE, Product or Lot
  // oee%, a%, p%, q% by time
  async findOeeByTime(
    siteId: number,
    chartType: string,
    ids: number[],
    duration: string,
    from: Date,
    to: Date,
  ): Promise<any> {
    const fieldName = this.getFieldName(chartType);
    const site = await this.siteRepository.findOneBy({ id: siteId });
    const cutoffHour = dayjs(site.cutoffTime).format('HH:mm:00');
    const rows = await this.getOeeStatsByTime(ids, duration, from, to, fieldName, cutoffHour);

    if (rows.length === 0) {
      return {
        rows: [],
        sumRows: [],
      };
    }

    const group = rows.reduce((acc, item) => {
      const key = dayjs(item.timeslot).toISOString();
      if (key in acc) {
        acc[key].push(item);
      } else {
        acc[key] = [item];
      }
      return acc;
    }, {});

    const names = await this.getNames(fieldName, rows);
    const lotNumbers = await this.getLotNumbers(rows);
    const dataRows: any[] = [];
    const oeeRows: any[] = [];
    for (const key of Object.keys(group)) {
      const sumOee = await this.sumOeeData(group[key], fieldName, names, lotNumbers);
      oeeRows.push(this.calculateOee(sumOee, key));

      const obj: any = {};
      obj[key] = sumOee;
      dataRows.push(obj);
    }

    return {
      rows: dataRows,
      sumRows: oeeRows,
    };
  }

  private getBatchStats(fieldName: string, ids: number[], from: Date, to: Date): Promise<any[]> {
    const query =
      'select a.id, a.data, a.oeeId, a.oeeBatchId, a.productId, a.timestamp\n' +
      'from oeeBatchStats a\n' +
      '         inner join (select max(id) as id, oeeBatchId\n' +
      '                     from oeeBatchStats\n' +
      `                     where ${fieldName} IN (${ids.join(', ')})\n` +
      '                       and timestamp >= ?\n' +
      '                       and timestamp <= ?\n' +
      '                     group by oeeBatchId) b\n' +
      '                    on a.id = b.id and a.oeeBatchId = b.oeeBatchId\n' +
      `where a.${fieldName} IN (${ids.join(', ')})\n` +
      '  and a.timestamp >= ?\n' +
      '  and a.timestamp <= ?;';
    return this.entityManager.query(query, [from, to, from, to]);
  }

  // OEE - By M/C
  // sum of days (from - to) for each of selected OEEs, Products or Lots
  // From - To
  // Multiple OEEs, Products or Lots
  // oee%, a%, p%, q% by m/c
  async findOeeByObject(siteId: number, chartType: string, ids: number[], from: Date, to: Date): Promise<any> {
    const fieldName = this.getFieldName(chartType);
    const rows = await this.getBatchStats(fieldName, ids, from, to);

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

    const names = await this.getNames(fieldName, rows);
    const lotNumbers = await this.getLotNumbers(rows);
    const oeeRows: any[] = [];
    const dataRows: any[] = [];
    for (const key of Object.keys(group)) {
      const objName = await this.getObjectName(Number(key), chartType);
      const sumOee = await this.sumOeeData(group[key], fieldName, names, lotNumbers);
      oeeRows.push(await this.calculateOee(sumOee, objName));

      const obj: any = {};
      obj[key] = sumOee;
      dataRows.push(obj);
    }

    return {
      rows: dataRows,
      sumRows: oeeRows,
    };
  }

  private getBatchTimelines(
    fieldName: string,
    ids: number[],
    from: Date,
    to: Date,
  ): Promise<OeeBatchStatsTimelineEntity[]> {
    return this.oeeBatchStatsTimelineRepository
      .createQueryBuilder()
      .where(`${fieldName} IN (:...ids)`, { ids })
      .andWhere('fromDate >= :from and toDate <= :to', { from, to })
      .getMany();
  }

  private getMcStatusFromSumStats(key: string, item: any, dataRow: { [p: string]: OeeSumData }): any {
    const { operatingSeconds, totalBreakdownSeconds, plannedDowntimeSeconds, machineSetupSeconds } = dataRow[key];
    const totalBreakdown = totalBreakdownSeconds - machineSetupSeconds;
    item.status['running'] = operatingSeconds;
    item.status['breakdown'] = totalBreakdown;
    item.status['planned'] = plannedDowntimeSeconds;
    item.status['mc_setup'] = machineSetupSeconds;
    return item;
  }

  private getOpUnit(duration): OpUnitType {
    if (duration === 'hourly') {
      return 'h';
    } else if (duration === 'daily') {
      return 'd';
    } else if (duration === 'monthly') {
      return 'M';
    }
    throw new Error('Unknown duration');
  }

  private getManipulateType(duration): ManipulateType {
    if (duration === 'hourly') {
      return 'h';
    } else if (duration === 'daily') {
      return 'd';
    } else if (duration === 'monthly') {
      return 'M';
    }
    throw new Error('Unknown duration');
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
    const rows = await this.getBatchTimelines(fieldName, ids, from, to);

    if (rows.length === 0) {
      return {
        sumRows: [],
      };
    }

    const site = await this.siteRepository.findOneBy({ id: siteId });
    const cutoffHour = dayjs(site.cutoffTime).format('HH:mm:00');
    const statsRows = await this.getOeeStatsByTime(ids, duration, from, to, fieldName, cutoffHour);

    const group = statsRows.reduce((acc, item) => {
      const key = dayjs(item.timeslot).toISOString();
      if (key in acc) {
        acc[key].push(item);
      } else {
        acc[key] = [item];
      }
      return acc;
    }, {});

    const opUnit = this.getOpUnit(duration);
    const manType = this.getManipulateType(duration);
    const names = await this.getNames(fieldName, statsRows);
    const lotNumbers = await this.getLotNumbers(statsRows);
    const result = [];

    for (const key of Object.keys(group)) {
      const currentTimeslot = dayjs(key);
      const tempRows = rows.filter((row) => currentTimeslot.isBetween(row.fromDate, row.toDate, opUnit, '[]'));
      const sumOee = await this.sumOeeData(group[key], fieldName, names, lotNumbers);

      const obj: any = {};
      obj[key] = sumOee;

      const item = {
        key,
        status: tempRows.reduce((acc, row) => {
          const key = row.status;
          const start = dayjs(row.fromDate);
          const end = dayjs(row.toDate);

          const actualStart = row.fromDate >= currentTimeslot.toDate() ? start : currentTimeslot;
          const actualEnd =
            row.toDate <= currentTimeslot.add(1, manType).toDate() ? end : currentTimeslot.add(1, manType);

          if (key in acc) {
            acc[key] = acc[key] + actualEnd.diff(actualStart, 's');
          } else {
            acc[key] = actualEnd.diff(actualStart, 's');
          }
          return acc;
        }, {}),
      };

      result.push({
        ...item,
        ...this.getMcStatusFromSumStats(key, item, obj),
      });
    }

    return {
      sumRows: result,
    };
  }

  // MC - By M/C
  // sum of days (from - to) for each of selected OEEs, Products or Lots
  // From - To
  // Multiple OEEs, Products or Lots
  async findMcByObject(siteId: number, chartType: string, ids: number[], from: Date, to: Date): Promise<any> {
    const fieldName = this.getFieldName(chartType);
    const rows = await this.getBatchTimelines(fieldName, ids, from, to);

    if (rows.length === 0) {
      return {
        sumRows: [],
      };
    }

    const statsRows = await this.getBatchStats(fieldName, ids, from, to);
    const group = statsRows.reduce((acc, item) => {
      const key = item[fieldName];
      if (key in acc) {
        acc[key].push(item);
      } else {
        acc[key] = [item];
      }
      return acc;
    }, {});

    const names = await this.getNames(fieldName, statsRows);
    const lotNumbers = await this.getLotNumbers(statsRows);
    const result = [];

    for (const key of Object.keys(group)) {
      const objName = await this.getObjectName(Number(key), chartType);
      const sumOee = await this.sumOeeData(group[key], fieldName, names, lotNumbers);

      const obj: any = {};
      obj[key] = sumOee;

      const item = {
        key: objName,
        status: rows.reduce((acc, row) => {
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
      };

      result.push({
        ...item,
        ...this.getMcStatusFromSumStats(key, item, obj),
      });
    }

    return {
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

      console.log(analyticQParams);
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

  // private sumOeeData(
  //   rows: AnalyticStatsEntity[],
  //   fieldName: string,
  //   names: { [key: number]: string },
  //   lotNumbers: { [key: number]: string },
  // ): OeeSumData {
  //   const initSum: OeeSumData = {
  //     name: '',
  //     runningSeconds: 0,
  //     operatingSeconds: 0,
  //     totalBreakdownSeconds: 0,
  //     plannedDowntimeSeconds: 0,
  //     machineSetupSeconds: 0,
  //     totalCount: 0,
  //     totalAutoDefects: 0,
  //     totalManualDefects: 0,
  //     totalOtherDefects: 0,
  //     totalCountByBatch: {},
  //   };
  //
  //   return rows.reduce((acc, row) => {
  //     const { data, oeeBatchId } = row;
  //     const {
  //       standardSpeedSeconds,
  //       runningSeconds,
  //       operatingSeconds,
  //       totalBreakdownSeconds,
  //       plannedDowntimeSeconds,
  //       machineSetupSeconds,
  //       totalCount,
  //       totalAutoDefects,
  //       totalManualDefects,
  //       totalOtherDefects,
  //     } = data;
  //
  //     const totalCountByBatch = { ...acc.totalCountByBatch };
  //     if (oeeBatchId in totalCountByBatch) {
  //       totalCountByBatch[oeeBatchId].totalCount += totalCount;
  //     } else {
  //       totalCountByBatch[oeeBatchId] = {
  //         lotNumber: Object.keys(lotNumbers).indexOf(oeeBatchId.toString()) >= 0 ? lotNumbers[oeeBatchId] : '',
  //         standardSpeedSeconds,
  //         totalCount,
  //       };
  //     }
  //
  //     return {
  //       name: Object.keys(names).indexOf(row[fieldName].toString()) >= 0 ? names[row[fieldName]] : '',
  //       runningSeconds: acc.runningSeconds + runningSeconds,
  //       operatingSeconds: acc.operatingSeconds + operatingSeconds,
  //       totalBreakdownSeconds: acc.totalBreakdownSeconds + totalBreakdownSeconds,
  //       plannedDowntimeSeconds: acc.plannedDowntimeSeconds + plannedDowntimeSeconds,
  //       machineSetupSeconds: acc.machineSetupSeconds + machineSetupSeconds,
  //       totalCount: acc.totalCount + totalCount,
  //       totalAutoDefects: acc.totalAutoDefects + totalAutoDefects,
  //       totalManualDefects: acc.totalManualDefects + totalManualDefects,
  //       totalOtherDefects: acc.totalOtherDefects + totalOtherDefects,
  //       totalCountByBatch,
  //     };
  //   }, initSum);
  // }

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

    const loadingSeconds = runningSeconds - plannedDowntimeSeconds;
    const nonZeroLoadingSeconds = loadingSeconds === 0 ? 1 : loadingSeconds;
    const operatingSeconds = loadingSeconds - totalBreakdownSeconds;

    // calculate A
    const aPercent = operatingSeconds / nonZeroLoadingSeconds;

    // calculate P
    const totalP = Object.keys(totalCountByBatch).reduce((acc, key) => {
      acc += totalCountByBatch[key].totalCount * totalCountByBatch[key].standardSpeedSeconds;
      return acc;
    }, 0);
    const pPercent = totalP / operatingSeconds;

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

  private async calculateParetoA(aParams: AnalyticAParam[], mcParams: MachineParameterEntity[]): Promise<ParetoData> {
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

    const finalList = [...listFirstNine];
    const otherList = list.filter((item) => item.key === 0);
    if (otherList.length > 0) {
      const itemOther = list.filter((item) => item.key === 0)[0];
      itemOther.count = itemOther.count + restOfTheList.reduce((sum, item) => sum + item.count, 0);
      labels.push('Other');
      finalList.push(itemOther);
    }

    const counts: number[] = finalList.map((item) => item.count);
    const percents: number[] = finalList.map((item, idx, arr) => {
      const sum = arr.slice(0, idx + 1).reduce((sum, item) => sum + item.count, 0);
      return (sum / total) * 100;
    });

    const emptyItems = counts.reduce((acc, item, idx) => {
      if (item === 0) {
        acc.push(idx);
      }
      return acc;
    }, []);

    return {
      labels: labels.filter((item, idx) => emptyItems.indexOf(idx) < 0),
      counts: counts.filter((item, idx) => emptyItems.indexOf(idx) < 0),
      percents: percents.filter((item, idx) => emptyItems.indexOf(idx) < 0),
    };
  }

  private async calculateParetoP(pParams: AnalyticPParam[], mcParams: MachineParameterEntity[]): Promise<ParetoData> {
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
    const finalList = [...listFirstNine];
    const otherList = list.filter((item) => item.key === 0);
    if (otherList.length > 0) {
      const itemOther = list.filter((item) => item.key === 0)[0];
      itemOther.count = itemOther.count + restOfTheList.reduce((sum, item) => sum + item.count, 0);
      labels.push('Other');
      finalList.push(itemOther);
    }

    const counts: number[] = finalList.map((item) => item.count);
    const percents: number[] = finalList.map((item, idx, arr) => {
      const sum = arr.slice(0, idx + 1).reduce((sum, item) => sum + item.count, 0);
      return (sum / total) * 100;
    });

    const emptyItems = counts.reduce((acc, item, idx) => {
      if (item === 0) {
        acc.push(idx);
      }
      return acc;
    }, []);

    return {
      labels: labels.filter((item, idx) => emptyItems.indexOf(idx) < 0),
      counts: counts.filter((item, idx) => emptyItems.indexOf(idx) < 0),
      percents: percents.filter((item, idx) => emptyItems.indexOf(idx) < 0),
    };
  }

  private async calculateParetoQ(qParams: AnalyticQParam[], mcParams: MachineParameterEntity[]): Promise<ParetoData> {
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
    const finalList = [...listFirstNine];
    const otherList = list.filter((item) => item.key === 0);
    if (otherList.length > 0) {
      const itemOther = list.filter((item) => item.key === 0)[0];
      itemOther.count = itemOther.count + restOfTheList.reduce((sum, item) => sum + item.count, 0);
      labels.push('Other');
      finalList.push(itemOther);
    }

    const counts: number[] = finalList.map((item) => item.count);
    const percents: number[] = finalList.map((item, idx, arr) => {
      const sum = arr.slice(0, idx + 1).reduce((sum, item) => sum + item.count, 0);
      return (sum / total) * 100;
    });

    const emptyItems = counts.reduce((acc, item, idx) => {
      if (item === 0) {
        acc.push(idx);
      }
      return acc;
    }, []);

    return {
      labels: labels.filter((item, idx) => emptyItems.indexOf(idx) < 0),
      counts: counts.filter((item, idx) => emptyItems.indexOf(idx) < 0),
      percents: percents.filter((item, idx) => emptyItems.indexOf(idx) < 0),
    };
  }

  private sumAParamData(aParams: AnalyticAParam[], mcParams: MachineParameterEntity[]): ParamData {
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

  private sumPParamData(pParams: AnalyticPParam[], mcParams: MachineParameterEntity[]): ParamData {
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

  private sumQParamData(qParams: AnalyticQParam[], mcParams: MachineParameterEntity[]): ParamData {
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

  private async getNames(fieldName: string, rows: any[]): Promise<{ [key: number]: string }> {
    const ids = rows.reduce((acc, item) => (acc.indexOf(item[fieldName]) < 0 ? [...acc, item[fieldName]] : acc), []);

    if (fieldName === 'oeeId') {
      const oees = await this.oeeRepository.find({
        where: { id: In(ids) },
        select: ['id', 'oeeCode', 'productionName'],
      });

      return oees.reduce((acc, item) => {
        acc[item.id] = item.productionName;
        return acc;
      }, {});
    } else if (fieldName === 'oeeBatchId') {
      const batches = await this.oeeBatchRepository.find({
        where: { id: In(ids) },
        select: ['id', 'lotNumber'],
      });
      return batches.reduce((acc, item) => {
        acc[item.id] = item.lotNumber;
        return acc;
      }, {});
    } else if (fieldName === 'productId') {
      const products = await this.productRepository.find({
        where: { id: In(ids) },
        select: ['id', 'sku', 'name'],
      });
      return products.reduce((acc, item) => {
        acc[item.id] = item.name;
        return acc;
      }, {});
    }
    return {};
  }

  private async getLotNumbers(rows: any[]): Promise<{ [key: number]: string }> {
    const ids = rows.reduce((acc, item) => (acc.indexOf(item.oeeBatchId) < 0 ? [...acc, item.oeeBatchId] : acc), []);
    const batches = await this.oeeBatchRepository.find({
      where: { id: In(ids) },
      select: ['id', 'lotNumber'],
    });
    return batches.reduce((acc, item) => {
      acc[item.id] = item.lotNumber;
      return acc;
    }, {});
  }

  private async sumOeeData(
    rows: any[],
    fieldName: string,
    names: { [key: number]: string },
    lotNumbers: { [key: number]: string },
  ): Promise<OeeSumData> {
    const initSum: OeeSumData = {
      name: '',
      runningSeconds: 0,
      operatingSeconds: 0,
      totalBreakdownSeconds: 0,
      plannedDowntimeSeconds: 0,
      machineSetupSeconds: 0,
      totalCount: 0,
      totalAutoDefects: 0,
      totalManualDefects: 0,
      totalOtherDefects: 0,
      totalCountByBatch: {},
    };

    const ids = new Set(rows.map((row) => row.oeeBatchId));
    const oeeBatches = await this.oeeBatchRepository.findBy({ id: In(Array.from(ids)) });

    return rows.reduce((acc, row) => {
      const { data, oeeBatchId } = row;
      const batch = oeeBatches.find((batch) => batch.id === oeeBatchId);
      const {
        runningSeconds,
        operatingSeconds,
        totalBreakdownSeconds,
        plannedDowntimeSeconds,
        machineSetupSeconds,
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
          lotNumber: Object.keys(lotNumbers).indexOf(oeeBatchId.toString()) >= 0 ? lotNumbers[oeeBatchId] : '',
          standardSpeedSeconds: batch.standardSpeedSeconds,
          totalCount,
        };
      }

      return {
        name: Object.keys(names).indexOf(row[fieldName].toString()) >= 0 ? names[row[fieldName]] : '',
        runningSeconds: acc.runningSeconds + runningSeconds,
        operatingSeconds: acc.operatingSeconds + operatingSeconds || 0,
        totalBreakdownSeconds: acc.totalBreakdownSeconds + totalBreakdownSeconds,
        plannedDowntimeSeconds: acc.plannedDowntimeSeconds + plannedDowntimeSeconds,
        machineSetupSeconds: acc.machineSetupSeconds + machineSetupSeconds,
        totalCount: acc.totalCount + totalCount,
        totalAutoDefects: acc.totalAutoDefects + totalAutoDefects,
        totalManualDefects: acc.totalManualDefects + totalManualDefects,
        totalOtherDefects: acc.totalOtherDefects + totalOtherDefects,
        totalCountByBatch,
      };
    }, initSum);
  }
}
