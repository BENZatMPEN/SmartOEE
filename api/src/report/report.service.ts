import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SiteEntity } from "../common/entities/site.entity";
import { Between, EntityManager, In, IsNull, LessThanOrEqual, MoreThan, MoreThanOrEqual, Not, Repository } from "typeorm";
import * as dayjs from 'dayjs';
import { AnalyticStatsParamEntity } from "../common/entities/analytic-stats-param.entity";
import { AnalyticEntity } from "../common/entities/analytic.entity";
import { OeeBatchAEntity } from "../common/entities/oee-batch-a.entity";
import { OeeBatchPEntity } from "../common/entities/oee-batch-p.entity";
import { OeeBatchQEntity } from "../common/entities/oee-batch-q.entity";
import { OeeBatchStatsTimelineEntity } from "../common/entities/oee-batch-stats-timeline.entity";
import { OeeBatchStatsEntity } from "../common/entities/oee-batch-stats.entity";
import { OeeBatchEntity } from "../common/entities/oee-batch.entity";
import { OeeEntity } from "../common/entities/oee.entity";
import { ProductEntity } from "../common/entities/product.entity";
import { QueryReportOeeDto } from "./dto/report.dto";
import { OeeProductEntity } from "../common/entities/oee-product.entity";
import { OeeBatchPlannedDowntimeEntity } from "../common/entities/oee-batch-planned-downtime.entity";
import { MachineParameterEntity } from "../common/entities/machine-parameter.entity";
import { OeeMachineEntity } from "../common/entities/oee-machine.entity";
import * as _ from 'lodash';
import { AnalyticAParam, AnalyticPParam, AnalyticQParam } from "../common/type/analytic-data";
import { OEE_PARAM_TYPE_A, OEE_PARAM_TYPE_P, OEE_PARAM_TYPE_Q } from "../common/constant";

type OeeSumData = {
    name: string;
    startDate: string;
    oeePercent: number;
    aPercent: number;
    pPercent: number;
    qPercent: number;
    plan: number;
    efficiency: number;
    runningSeconds: number;
    operatingSeconds: number;
    totalBreakdownSeconds: number;
    plannedDowntimeSeconds: number;
    machineSetupSeconds: number;
    totalCount: number;
    target: number;
    totalAutoDefects: number;
    totalManualDefects: number;
    totalOtherDefects: number;
    qNg: number;
    totalCountByBatch: {
        [key: string]: {
            lotNumber: string;
            standardSpeedSeconds: number;
            totalCount: number;
        };
    };
};

type CalculationItem = {
    key: number;
    count: number;
};

type BatchGroup = {
    [key: number]: OeeBatchEntity[];
};
@Injectable()
export class ReportService {

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
        @InjectRepository(OeeProductEntity)
        private readonly oeeProductRepository: Repository<OeeProductEntity>,
        @InjectRepository(OeeBatchPlannedDowntimeEntity)
        private readonly oeeBatchPlannedDowntime: Repository<OeeBatchPlannedDowntimeEntity>,

        private readonly entityManager: EntityManager,
    ) { }

    private getDurationChart(reportType: string): string {
        switch (reportType) {
            case 'daily':
                return 'hourly';

            case 'monthly':
                return 'daily';

            case 'yearly':
                return 'monthly';
        }
        return '';
    }

    private getDurationTable(reportType: string): string {
        switch (reportType) {
            case 'daily':
                return 'daily';

            case 'monthly':
                return 'daily';

            case 'yearly':
                return 'monthly';
        }
        return '';
    }

    async findOeeByTime(query: QueryReportOeeDto): Promise<any> {
        const { siteId, type, reportType, from, to } = query;
        let { ids } = query;
        const fieldName = this.getFieldName(type);
        const site = await this.siteRepository.findOneBy({ id: siteId });
        const cutoffHour = dayjs(site.cutoffTime).format('HH:mm:00');

        const rowsForTable = await this.getOeeStatsByTime(ids, this.getDurationTable(reportType), from, to, fieldName, cutoffHour);
        const rowsForChart = await this.getOeeStatsByTime(ids, this.getDurationChart(reportType), from, to, fieldName, cutoffHour);

        const groupChart = rowsForChart.reduce((acc, item) => {
            const key = dayjs(item.timeslot).toISOString();
            if (key in acc) {
                acc[key].push(item);
            } else {
                acc[key] = [item];
            }
            return acc;
        }, {});

        const groupTable = rowsForTable.reduce((acc, item) => {
            const key = dayjs(item.timeslot).toISOString();
            if (key in acc) {
                acc[key].push(item);
            } else {
                acc[key] = [item];
            }
            return acc;
        }, {});

        const names = await this.getNames(fieldName, rowsForChart);
        const lotNumbers = await this.getLotNumbers(rowsForChart);
        //table
        const dataRowsTable: any[] = [];
        const oeeRowsTable: any[] = [];
        const productionRowsChart: any[] = [];
        for (const key of Object.keys(groupTable)) {
            const sumOee = await this.sumOeeData(groupTable[key], fieldName, names, lotNumbers, type);
            sumOee.qNg = sumOee.totalAutoDefects + sumOee.totalManualDefects;
            sumOee.efficiency = (sumOee.totalCount / sumOee.target) * 100;
            oeeRowsTable.push(this.calculateOee(sumOee, key));
            productionRowsChart.push(this.calculateProductOee(sumOee, key));
            const obj: any = {};
            obj[key] = sumOee;
            dataRowsTable.push(obj);
        }
        //chart
        const dataRowsChart: any[] = [];
        const oeeRowsChart: any[] = [];
        for (const key of Object.keys(groupChart)) {
            const sumOee = await this.sumOeeData(groupChart[key], fieldName, names, lotNumbers, type);
            oeeRowsChart.push(this.calculateOee(sumOee, key));
        }

        return {
            table: {
                rows: _.sortBy(dataRowsTable, ['key']),
            },
            chart: {
                sumRows: _.sortBy(oeeRowsChart, ['key']),
                sumRowsProduction: _.sortBy(productionRowsChart, ['key']),
            }
        };
    }

    async findCauseByTime(query: QueryReportOeeDto): Promise<any> {
        const { siteId, type, reportType, viewType, from, to } = query;
        let { ids } = query;

        const site = await this.siteRepository.findOneBy({ id: siteId });
        const cutoffHour = dayjs(site.cutoffTime).format('HH:mm:00');
        const resultPlannedDowntime = await this.findPlanDowntimePareto(type, ids, from, to, reportType, viewType, cutoffHour);
        const resultA = await this.findAPareto(type, ids, from, to, reportType, viewType);
        const resultP = await this.findPPareto(type, ids, from, to, reportType, viewType);
        const resultQ = await this.findQPareto(type, ids, from, to, reportType, viewType);


        let listPlannedDowntime = [];
        let listA = [];
        let listP = [];
        let listQ = [];
        const mapping = await this.getBatchGroupByType(type, ids);
        for (const key of Object.keys(mapping)) {
            listPlannedDowntime = listPlannedDowntime.concat(resultPlannedDowntime.rows[key]);
            listA = listA.concat(resultA.rows[key]);
            listP = listP.concat(resultP.rows[key]);
            listQ = listQ.concat(resultQ.rows[key]);
        }
        listPlannedDowntime = _.sortBy(listPlannedDowntime, ['expiredAt'], ['asc']);
        listA = _.orderBy(listA, ['timestamp'], ['desc']);
        listP = _.orderBy(listP, ['timestamp'], ['desc']);
        listQ = _.orderBy(listQ, ['amount'], ['desc']);

        // //find max length of array
        const maxLength = Math.max(listPlannedDowntime.length, listA.length, listP.length, listQ.length);
        // // Create an array to store the result
        const result = [];

        // Loop through each index
        for (let i = 0; i < maxLength; i++) {
            const newItem = {
                "date": from,
                "planDownTimeName": (listPlannedDowntime[i] && listPlannedDowntime[i].name) || "",
                "planDownTimeDuration": (listPlannedDowntime[i] && listPlannedDowntime[i].duration) || "",
                "planDownTimeSeconds": (listPlannedDowntime[i] && listPlannedDowntime[i].seconds) || "",
                "planDownTimeCreateAt": listPlannedDowntime[i] && listPlannedDowntime[i].createdAt || "",
                "oeeBatchAName": (listA[i] && listA[i].paramName) || "",
                "oeeBatchASeconds": (listA[i] && listA[i].seconds) || "",
                "oeeBatchATimestamp": listA[i] && listA[i].timestamp || "",
                "oeeBatchPName": (listP[i] && listP[i].paramName) || "",
                "oeeBatchPSeconds": (listP[i] && listP[i].seconds) || "",
                "oeeBatchPTimestamp": listP[i] && listP[i].timestamp || "",
                "oeeBatchQName": (listQ[i] && listQ[i].paramName) || "",
                "oeeBatchQAmount": (listQ[i] && listQ[i].amount) || 0,
            };
            result.push(newItem);
        }
        return {
            sumRows: {
                planDownTime: resultPlannedDowntime.sumRows,
                oeeBatchA: resultA.sumRows,
                oeeBatchP: resultP.sumRows,
                oeeBatchQ: resultQ.sumRows,
            },
            rows: result,
        };
    }

    private async getOeeBatchA(oeeBatchIds: number[], oeeMachines: OeeMachineEntity[]): Promise<any> {
        const oeeBatchA = await this.oeeBatchARepository.find({
            where: {
                oeeBatchId: In(oeeBatchIds),
                machineParameterId: Not(IsNull())
            }
        });

        const updatedOeeBatchA = await Promise.all(oeeBatchA?.map(async item => {
            return {
                id: item.id,
                seconds: item.seconds,
                timestamp: item.timestamp,
                oeeBatchId: item.oeeBatchId,
                machineParameterId: item.machineParameterId,
                machineParameterName: await this.getParameterName(item.machineId, item.machineParameterId, oeeMachines)
            }
        }));

        return updatedOeeBatchA;

    }

    private async getOeeBatchP(oeeBatchIds: number[], oeeMachines: OeeMachineEntity[]): Promise<any> {
        const oeeBatchP = await this.oeeBatchPRepository.find({
            where: {
                oeeBatchId: In(oeeBatchIds),
                machineParameterId: Not(IsNull())
            }
        });

        const updatedOeeBatchP = await Promise.all(oeeBatchP?.map(async item => {
            return {
                id: item.id,
                seconds: item.seconds,
                timestamp: item.timestamp,
                oeeBatchId: item.oeeBatchId,
                machineParameterId: item.machineParameterId,
                machineParameterName: await this.getParameterName(item.machineId, item.machineParameterId, oeeMachines)
            }
        }));

        return updatedOeeBatchP;
    }

    private async getOeeBatchQ(oeeBatchIds: number[], oeeMachines: OeeMachineEntity[]): Promise<any> {
        const oeeBatchQ = await this.oeeBatchQRepository.find({
            where: {
                oeeBatchId: In(oeeBatchIds),
                machineParameterId: Not(IsNull())
            }
        });

        const updatedOeeBatchQ = await Promise.all(oeeBatchQ?.map(async item => {
            return {
                id: item.id,
                oeeBatchId: item.oeeBatchId,
                machineParameterId: item.machineParameterId,
                machineParameterName: await this.getParameterName(item.machineId, item.machineParameterId, oeeMachines),
                amount: item.autoAmount + item.manualAmount
            }
        }));

        return updatedOeeBatchQ;
    }

    private async getParameterName(machineId: number, parameterId: number, oeeMachines: OeeMachineEntity[]): Promise<string> {
        const machineParameter = oeeMachines.find(machine => machine.machine.id === machineId)?.machine.parameters;
        const parameter = machineParameter?.find(parameter => parameter.id === parameterId);
        return Promise.resolve(parameter?.name || '');
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
                'order by a.oeeBatchId, a.timestamp;';

            const minus1HourFrom = dayjs(from).add(-1, 'h').startOf('h').toDate();
            rows = await this.entityManager.query(query, [minus1HourFrom, to]);
        } else if (duration === 'daily') {
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
                'order by a.oeeBatchId, a.timestamp;';

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
                'order by a.oeeBatchId, a.timestamp;';

            const minus1MonthFrom = dayjs(from).add(-1, 'M').startOf('M').toDate();
            rows = await this.entityManager.query(query, [minus1MonthFrom, to, minus1MonthFrom, to]);
        } else if (duration === 'yearly') {
            const query =
                'select a.id, a.data, a.oeeId, a.oeeBatchId, a.productId, a.timestamp, c.startOfDay as timeslot\n' +
                'from oeeBatchStats a\n' +
                '         inner join (select max(b.id) as id,\n' +
                '                            b.oeeBatchId,\n' +
                '                            c.startOfDay,\n' +
                '                            c.endOfDay\n' +
                '                     from oeeBatchStats b\n' +
                '                              inner join (select oeeBatchId,\n' +
                `                                                 CAST(DATE_FORMAT(timestamp, '%Y-01-01 ${cutoffHour}') as datetime)                           as startOfDay,\n` +
                `                                                 CAST(DATE_FORMAT(last_day(timestamp), '%Y-12-31 ${cutoffHour}') as datetime) as endOfDay\n` +
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
                'order by a.oeeBatchId, a.timestamp;';

            const minus1YearFrom = dayjs(from).add(-1, 'y').startOf('y').toDate();
            rows = await this.entityManager.query(query, [minus1YearFrom, to, minus1YearFrom, to]);
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
        type: string,
    ): Promise<OeeSumData> {
        // สร้างข้อมูลเริ่มต้นสำหรับการรวม
        const initSum: OeeSumData = {
            name: '',
            startDate: '',
            oeePercent: 0,
            aPercent: 0,
            pPercent: 0,
            qPercent: 0,
            plan: 0,
            efficiency: 0,
            runningSeconds: 0,
            operatingSeconds: 0,
            totalBreakdownSeconds: 0,
            plannedDowntimeSeconds: 0,
            machineSetupSeconds: 0,
            totalCount: 0,
            target: 0,
            totalAutoDefects: 0,
            totalManualDefects: 0,
            totalOtherDefects: 0,
            qNg: 0,
            totalCountByBatch: {},
        };

        // ดึงรายการ id ที่ไม่ซ้ำกันจาก rows
        const ids = new Set(rows.map((row) => row.oeeBatchId));
        // ดึงข้อมูล OEE Batch จากฐานข้อมูล
        const oeeBatches = await this.oeeBatchRepository
            .createQueryBuilder('oeeBatch')
            .leftJoinAndSelect('oeeBatch.oee', 'oee')
            .where('oeeBatch.id IN (:...ids)', { ids: Array.from(ids) })
            .getMany();

        // รวมข้อมูลจากแต่ละแถว
        return rows.reduce((acc, row) => {
            const { data, oeeBatchId } = row;
            const batch = oeeBatches.find((batch) => batch.id === oeeBatchId);

            // ดึงข้อมูลจาก data
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

            // สร้างคัดลอกของ totalCountByBatch
            const totalCountByBatch = { ...acc.totalCountByBatch };

            // อัปเดตข้อมูลใน totalCountByBatch
            if (oeeBatchId in totalCountByBatch) {
                totalCountByBatch[oeeBatchId].totalCount += totalCount;
            } else {
                totalCountByBatch[oeeBatchId] = {
                    lotNumber: Object.keys(lotNumbers).includes(oeeBatchId.toString()) ? lotNumbers[oeeBatchId] : '',
                    standardSpeedSeconds: batch.standardSpeedSeconds,
                    totalCount,
                };
            }
            const lotNumber = type === 'product' || type === 'oee' ? '' : batch.lotNumber;
            // const startDate = type === 'product' || type === 'oee' ? '' : batch.startDate;
            const ct = type === 'product' || type === 'oee' ? '' : batch.standardSpeedSeconds;
            const productSku = type === 'oee' ? '' : batch.product.sku;
            // รวมข้อมูลทั้งหมด
            return {
                name: Object.keys(names).includes(row[fieldName].toString()) ? names[row[fieldName]] : '',
                oeeCode: batch.oee.oeeCode,
                productName: batch.product.name,
                productSku: productSku,
                lotNumber: lotNumber,
                ct: ct,
                startDate: batch.startDate,
                plan: acc.plan + batch.plannedQuantity,
                efficiency: acc.efficiency + batch.oeeStats.efficiency,
                runningSeconds: acc.runningSeconds + runningSeconds,
                operatingSeconds: acc.operatingSeconds + operatingSeconds || 0,
                totalBreakdownSeconds: acc.totalBreakdownSeconds + totalBreakdownSeconds,
                plannedDowntimeSeconds: acc.plannedDowntimeSeconds + plannedDowntimeSeconds,
                machineSetupSeconds: acc.machineSetupSeconds + machineSetupSeconds,
                totalCount: acc.totalCount + totalCount,
                target: acc.target + batch?.oeeStats?.target || 0,
                totalAutoDefects: acc.totalAutoDefects + totalAutoDefects,
                totalManualDefects: acc.totalManualDefects + totalManualDefects,
                totalOtherDefects: acc.totalOtherDefects + totalOtherDefects,
                totalCountByBatch,
            };
        }, initSum);
    }

    private calculateProductOee(sumData: OeeSumData, key: string): any {
        const {
            totalAutoDefects,
            qNg,
            totalCount,
            plan,
            target,
        } = sumData;
        return {
            key,
            qOk: totalAutoDefects,
            qNg: qNg,
            actual: totalCount,
            plan: plan,
            efficiency: (totalCount / target) * 100,
        };
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
        sumData.aPercent = aPercent * 100;
        sumData.pPercent = pPercent * 100;
        sumData.qPercent = qPercent * 100;
        sumData.oeePercent = oeePercent * 100;
        return {
            key,
            aPercent: aPercent * 100,
            pPercent: pPercent * 100,
            qPercent: qPercent * 100,
            oeePercent: oeePercent * 100,
        };
    }

    private async findPlanDowntimePareto(chartType: string, ids: number[], from: Date, to: Date, reportType: string, viewType: string, cutoffHour: string): Promise<any> {
        const mapping = await this.getBatchGroupByType(chartType, ids);
        const rows = {};
        const result = {};
        const keys = Object.keys(mapping);
        for (const key of keys) {
            const oeeBatchPlannedDowntime = await this.oeeBatchPlannedDowntime.find({
                where: {
                    oeeBatchId: In(mapping[key].map((item) => item.id)),
                    expiredAt: Between(from, to)
                }
            });
            //add duration oeeBatchPlannedDowntime
            const newOeeBatchPlannedDowntime = await Promise.all(oeeBatchPlannedDowntime.map(async item => {
                const duration = item.expiredAt ? dayjs(item.expiredAt).diff(item.createdAt, 'second') : item.seconds;
                return {
                    ...item,
                    duration: duration
                }
            }));

            //group oeeBatchPlannedDowntime by name
            if ((reportType === 'yearly' || reportType === 'monthly') && viewType === 'grouped') {
                const result = newOeeBatchPlannedDowntime.reduce((acc, item) => {
                    const existing = acc.find(x => x.name === item.name);
                    if (existing) {
                        existing.duration += item.duration;
                    } else {
                        acc.push({
                            name: item.name,
                            duration: item.duration
                        });
                    }
                    return acc;
                }, []);
                rows[key] = result;
            } else {
                rows[key] = newOeeBatchPlannedDowntime;
            }
            const total = newOeeBatchPlannedDowntime.reduce((acc, item) => acc + item.duration, 0);
            const list = newOeeBatchPlannedDowntime.reduce((acc, item) => {
                const existingItem = acc.find(x => x.name === item.name);
                if (existingItem) {
                    existingItem.count += item.duration;
                } else {
                    acc.push({ name: item.name, count: item.duration });
                }
                return acc;
            }, []);

            const sortedList = list.sort((a, b) => (b.count > a.count ? 1 : a.count > b.count ? -1 : 0));
            const listFirstNine = sortedList.slice(0, 9);
            const restOfTheList = sortedList.slice(9, sortedList.length);

            const labels = listFirstNine.map((item) => item.name);
            const finalList = [...listFirstNine];
            const otherList = list.filter((item) => item.key === 0);
            if (otherList.length > 0) {
                const itemOther = list.filter((item) => item.key === 0)[0];
                itemOther.count = itemOther.count + restOfTheList.reduce((sum, item) => sum + item.count, 0);
                labels.push('Other');
                finalList.push(itemOther);
            }
            const counts: number[] = finalList.map((item) => item.count);
            const percents: number[] = finalList.map((item) => (item.count / total) * 100);
            result[key] = {
                labels,
                counts,
                percents,
            }
        }

        return {
            rows: rows,
            sumRows: result,
        };
    }

    private async findAPareto(chartType: string, ids: number[], from: Date, to: Date, reportType: string, viewType: string): Promise<any> {
        const mapping = await this.getBatchGroupByType(chartType, ids);
        const result = {};
        const rows = {};
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
            // rows[key] = await this.mapMachineParametersToAnalytics(analyticAParams, _.uniqWith(mcParams, (pre, cur) => {
            const mapParameter = await this.mapMachineParametersToAnalytics(analyticAParams, _.uniqWith(mcParams, (pre, cur) => {
                if (pre.id == cur.id) {
                    cur.name = cur.name === pre.name ? pre.name : cur.name + ' / ' + pre.name;
                    return true;
                }
                return false;
            }),);

            if ((reportType === 'yearly' || reportType === 'monthly') && viewType === 'grouped') {
                rows[key] = mapParameter.reduce((acc, item) => {
                    const existing = acc.find(x => x.paramName === item.paramName && x.paramType === item.paramType && x.machineParameterId === item.machineParameterId);
                    if (existing) {
                        existing.seconds += item.seconds;
                    } else {
                        acc.push({
                            paramType: item.paramType,
                            seconds: item.seconds,
                            machineParameterId: item.machineParameterId,
                            paramName: item.paramName
                        });
                    }

                    return acc;
                }, []);
            } else {
                rows[key] = mapParameter;
            }
        }

        return {
            rows: rows,
            sumRows: result,
        };
    }

    private async findPPareto(chartType: string, ids: number[], from: Date, to: Date, reportType: string, viewType: string): Promise<any> {
        const mapping = await this.getBatchGroupByType(chartType, ids);
        const result = {};
        const rows = {};
        const keys = Object.keys(mapping);
        for (const key of keys) {
            const analyticPParams = await this.analyticStatsParamRepository
                .createQueryBuilder()
                .where(`oeeBatchId IN (:...batchIds)`, { batchIds: mapping[key].map((item) => item.id) })
                .andWhere(`paramType = :paramType`, { paramType: OEE_PARAM_TYPE_P })
                .andWhere('timestamp >= :from and timestamp <= :to', { from, to })
                .getMany();

            // 1. Extract machines from each item
            const machines = mapping[key].map((item) => item.machines);

            // 2. Flatten the array of machines
            const flatMachines = machines.flat();

            // 3. Extract parameters from each machine where oeeType is OEE_PARAM_TYPE_P
            const parameters = flatMachines.map((mc) => mc.parameters.filter((mcParam) => mcParam.oeeType === OEE_PARAM_TYPE_P));

            // 4. Flatten the array of parameters
            const mcParams = parameters.flat();

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

            const mapParameter = await this.mapMachineParametersToAnalytics(analyticPParams, _.uniqWith(mcParams, (pre, cur) => {
                if (pre.id == cur.id) {
                    cur.name = cur.name === pre.name ? pre.name : cur.name + ' / ' + pre.name;
                    return true;
                }
                return false;
            }),);

            if ((reportType === 'yearly' || reportType === 'monthly') && viewType === 'grouped') {
                rows[key] = mapParameter.reduce((acc, item) => {
                    const existing = acc.find(x => x.paramName === item.paramName && x.paramType === item.paramType && x.machineParameterId === item.machineParameterId);
                    if (existing) {
                        existing.seconds += item.seconds;
                    } else {
                        acc.push({
                            paramType: item.paramType,
                            seconds: item.seconds,
                            machineParameterId: item.machineParameterId,
                            paramName: item.paramName,
                        });
                    }

                    return acc;
                }, []);
            } else {
                rows[key] = mapParameter;
            }
        }

        return {
            rows: rows,
            sumRows: result,
        };
    }

    private async findQPareto(chartType: string, ids: number[], from: Date, to: Date, reportType: string, viewType: string): Promise<any> {
        const mapping = await this.getBatchGroupByType(chartType, ids);
        const result = {};
        const rows = {};
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

            const mapParameter = await this.mapMachineParametersQToAnalytics(analyticQParams, _.uniqWith(mcParams, (pre, cur) => {
                if (pre.id == cur.id) {
                    cur.name = cur.name === pre.name ? pre.name : cur.name + ' / ' + pre.name;
                    return true;
                }
                return false;
            }),);

            if ((reportType === 'yearly' || reportType === 'monthly') && viewType === 'grouped') {
                rows[key] = mapParameter.reduce((acc, item) => {
                    const existing = acc.find(x => x.paramName === item.paramName && x.paramType === item.paramType && x.machineParameterId === item.machineParameterId);
                    if (existing) {
                        existing.amount += item.amount;
                    } else {
                        acc.push({
                            paramType: item.paramType,
                            amount: item.amount,
                            machineParameterId: item.machineParameterId,
                            paramName: item.paramName
                        });
                    }

                    return acc;
                }, []);
            } else {
                rows[key] = mapParameter;
            }
        }

        return {
            rows: rows,
            sumRows: result,
        };
    }

    private async calculateParetoA(aParams: AnalyticAParam[], mcParams: MachineParameterEntity[]): Promise<any> {
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
        }
    }

    private async calculateParetoP(pParams: AnalyticPParam[], mcParams: MachineParameterEntity[]): Promise<any> {
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
        }
    }

    private async calculateParetoQ(qParams: AnalyticQParam[], mcParams: MachineParameterEntity[]): Promise<any> {
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
        }
    }

    private async mapMachineParametersToAnalytics(analyticParams: AnalyticStatsParamEntity[], mcParams: MachineParameterEntity[]): Promise<any> {
        const list = analyticParams
            .map(item => ({
                ...item,
                machineId: item.data?.machineId,
                seconds: item.data?.seconds,
                machineParameterId: item.data?.machineParameterId
            }));
        const listAddParamName = list.map(item => ({
            ...item,
            paramName: mcParams.filter(param => param.id === item.machineParameterId)[0]?.name || 'other'
        }));
        return listAddParamName;
    }

    private async mapMachineParametersQToAnalytics(analyticParams: AnalyticStatsParamEntity[], mcParams: MachineParameterEntity[]): Promise<any> {
        const list = analyticParams
            .map(item => ({
                ...item,
                machineId: item.data?.machineId,
                amount: item.data?.autoAmount + item.data?.manualAmount,
                machineParameterId: item.data?.machineParameterId
            }));
        const listAddParamName = list.map(item => ({
            ...item,
            paramName: mcParams.filter(param => param.id === item.machineParameterId)[0]?.name || 'other'
        }));

        return listAddParamName;
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
}