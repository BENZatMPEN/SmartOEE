import { Injectable } from "@nestjs/common";
import { SiteEntity } from "src/common/entities/site.entity";
import { EntityManager, In, Repository } from "typeorm";
import { InjectRepository } from '@nestjs/typeorm';
import { OeeEntity } from "src/common/entities/oee.entity";
import { OeeBatchEntity } from "src/common/entities/oee-batch.entity";
import { ProductEntity } from "src/common/entities/product.entity";
import { UserEntity } from "src/common/entities/user.entity";
import { OeeStatus, OeeStatusItem } from '../common/type/oee-status';
import { AdvanceDto } from "./dto/advance.dto";
import * as dayjs from 'dayjs';
import { OeeRecord } from "src/common/type/advance";

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

type OeeStats = {
    oeeBatchId: number;
    oeeId: number;
    productId: number;
    timestamp: string;
    data: any;
};

interface OeeLossResult {
    oeeId: number;
    id: string;
    oeePercent: number;
    ALoss: number;
    PLoss: number;
    QLoss: number;
    timeslot: string;
    timestamp: Date;
}

interface OeeLossGrouped {
    oeeId: number;
    lossResult: OeeLossResult[];
}

@Injectable()
export class AdvanceService {
    constructor(
        @InjectRepository(SiteEntity)
        private readonly siteRepository: Repository<SiteEntity>,
        @InjectRepository(OeeEntity)
        private readonly oeeRepository: Repository<OeeEntity>,
        @InjectRepository(OeeBatchEntity)
        private readonly oeeBatchRepository: Repository<OeeBatchEntity>,
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        private readonly entityManager: EntityManager,
    ) { }

    async findAllOeeMode1(advanceDto: AdvanceDto, siteId: number): Promise<OeeStatus> {
        // Retrieve the user along with the associated OEE relations
        const user = await this.userRepository.findOne({
            where: { id: advanceDto.userId },
            relations: ['oees'],
        });

        // Get OEEs for the specified site that have not been deleted
        const oees = await this.oeeRepository.find({
            select: ['id'], // เลือกเฉพาะฟิลด์ id
            where: { siteId, deleted: false },
        });

        const oeeIds = oees.map(oee => oee.id);

        if (oeeIds.length === 0) {
            return {} as OeeStatus;
        }

        // Retrieve OEE statistics within the date range
        let statsRows: OeeStats[] = await this.getOeeStats(oeeIds, advanceDto.from, advanceDto.to);
        const oeeNames = await this.getOeeNames(statsRows);
        const lotNumbers = await this.getLotNumbers(statsRows);

        // Group the stats rows by oeeId
        const groupedStats = statsRows.reduce((acc: { [key: number]: OeeStats[] }, row) => {
            if (!acc[row.oeeId]) {
                acc[row.oeeId] = [];
            }
            acc[row.oeeId].push(row);
            return acc;
        }, {});

        // Base SQL query for aggregated status counts
        let sumRowsQuery = `
            WITH cte AS (
                SELECT DISTINCT b.oeeId,
                       FIRST_VALUE(b.id) OVER (PARTITION BY b.oeeId ORDER BY b.id DESC) AS batchId
                FROM oeeBatches AS b
            )
            SELECT IFNULL(SUM(IF(status = "running", 1, 0)), 0)   AS running,
                   IFNULL(SUM(IF(status = "ended" OR status IS NULL, 1, 0)), 0) AS ended,
                   IFNULL(SUM(IF(status = "standby" OR status = "planned", 1, 0)), 0) AS standby,
                   IFNULL(SUM(IF(status = "mc_setup", 1, 0)), 0)  AS mcSetup,
                   IFNULL(SUM(IF(status = "breakdown", 1, 0)), 0) AS breakdown
            FROM oees o
                 LEFT JOIN cte ON o.id = cte.oeeId
                 LEFT JOIN oeeBatches ob ON cte.batchId = ob.id
            WHERE o.siteId = ? AND o.deleted = 0
        `;

        const queryParams: any[] = [siteId];

        // For non-admin users, filter the stats rows based on user-associated OEEs
        if (user && user.isAdmin === false) {
            statsRows = statsRows.filter(row =>
                user.oees.some(userOee => userOee.id === row.oeeId)
            );
            const filteredOeeIds = statsRows.map(row => row.oeeId);

            if (filteredOeeIds.length === 0) {
                return {
                    running: 0,
                    breakdown: 0,
                    ended: 0,
                    standby: 0,
                    mcSetup: 0,
                    oees: [],
                };
            }

            queryParams.push(filteredOeeIds);
            sumRowsQuery += ' AND o.id IN (?)';
        }

        // Execute the aggregated SQL query
        const sumRows: any[] = await this.entityManager.query(sumRowsQuery, queryParams);
        const { running, ended, standby, breakdown, mcSetup } = sumRows[0];

        // Process each group of OEE stats concurrently
        const aggregatedData = await Promise.all(
            Object.keys(groupedStats).map(async (key) => {
                const oeeId = parseInt(key, 10);
                const oeeStats = groupedStats[oeeId];
                // Sum and calculate OEE data based on grouped stats
                const summedData = await this.sumOeeData(oeeStats, oeeNames, lotNumbers);
                // Optionally remove fields you do not need in the final response
                const { totalCountByBatch, ...filteredData } = summedData;
                const calculatedOee = this.calculateOee(summedData);
                return {
                    id: oeeId,
                    ...calculatedOee,
                    ...filteredData,
                };
            })
        );

        // Map the aggregated data into the expected response format
        const oeeStatusItems: OeeStatusItem[] = aggregatedData.map(item => ({
            id: item.id,
            oeeBatchId: 0,
            oeeCode: '',
            productionName: item.name,
            actual: item.totalCount,
            defect: item.totalAutoDefects + item.totalManualDefects,
            plan: 0,
            target: 0,
            oeePercent: item.oeePercent,
            lotNumber: '',
            batchStatus: '',
            startDate: new Date(),
            endDate: new Date(),
            useSitePercentSettings: 0, 
            percentSettings: [],
            standardSpeedSeconds: 0,
            productName: '',
            batchStartedDate: new Date(),
            batchStoppedDate: new Date(),
            activeSecondUnit: 0, 
          }));

        return {
            running,
            breakdown,
            ended,
            standby,
            mcSetup,
            oees: oeeStatusItems,
        } as OeeStatus;
    }

    async findAllOeeMode2(advanceDto: AdvanceDto, siteId: number): Promise<OeeStatus> {
        // Retrieve the user along with the associated OEE relations
        const user = await this.userRepository.findOne({
            where: { id: advanceDto.userId },
            relations: ['oees'],
        });

        // Get OEEs for the specified site that have not been deleted
        const oees = await this.oeeRepository.find({
            select: ['id'], // เลือกเฉพาะฟิลด์ id
            where: { siteId, deleted: false },
        });

        const oeeIds = oees.map(oee => oee.id);

        if (oeeIds.length === 0) {
            return {} as OeeStatus;
        }

        // Retrieve OEE statistics within the date range
        let statsRows: OeeStats[] = await this.getOeeStats(oeeIds, advanceDto.from, advanceDto.to);
        const oeeNames = await this.getOeeNames(statsRows);
        const lotNumbers = await this.getLotNumbers(statsRows);

        // Group the stats rows by oeeId
        const groupedStats = statsRows.reduce((acc: { [key: number]: OeeStats[] }, row) => {
            if (!acc[row.oeeId]) {
                acc[row.oeeId] = [];
            }
            acc[row.oeeId].push(row);
            return acc;
        }, {});

        // Base SQL query for aggregated status counts
        let sumRowsQuery = `
            WITH cte AS (
                SELECT DISTINCT b.oeeId,
                       FIRST_VALUE(b.id) OVER (PARTITION BY b.oeeId ORDER BY b.id DESC) AS batchId
                FROM oeeBatches AS b
            )
            SELECT IFNULL(SUM(IF(status = "running", 1, 0)), 0)   AS running,
                   IFNULL(SUM(IF(status = "ended" OR status IS NULL, 1, 0)), 0) AS ended,
                   IFNULL(SUM(IF(status = "standby" OR status = "planned", 1, 0)), 0) AS standby,
                   IFNULL(SUM(IF(status = "mc_setup", 1, 0)), 0)  AS mcSetup,
                   IFNULL(SUM(IF(status = "breakdown", 1, 0)), 0) AS breakdown
            FROM oees o
                 LEFT JOIN cte ON o.id = cte.oeeId
                 LEFT JOIN oeeBatches ob ON cte.batchId = ob.id
            WHERE o.siteId = ? AND o.deleted = 0
        `;

        const queryParams: any[] = [siteId];

        // For non-admin users, filter the stats rows based on user-associated OEEs
        if (user && user.isAdmin === false) {
            statsRows = statsRows.filter(row =>
                user.oees.some(userOee => userOee.id === row.oeeId)
            );
            const filteredOeeIds = statsRows.map(row => row.oeeId);

            if (filteredOeeIds.length === 0) {
                return {
                    running: 0,
                    breakdown: 0,
                    ended: 0,
                    standby: 0,
                    mcSetup: 0,
                    oees: [],
                };
            }

            queryParams.push(filteredOeeIds);
            sumRowsQuery += ' AND o.id IN (?)';
        }

        // Execute the aggregated SQL query
        const sumRows: any[] = await this.entityManager.query(sumRowsQuery, queryParams);
        const { running, ended, standby, breakdown, mcSetup } = sumRows[0];

        // Process each group of OEE stats concurrently
        const aggregatedData = await Promise.all(
            Object.keys(groupedStats).map(async (key) => {
                const oeeId = parseInt(key, 10);
                const oeeStats = groupedStats[oeeId];
                // Sum and calculate OEE data based on grouped stats
                const summedData = await this.sumOeeData(oeeStats, oeeNames, lotNumbers);
                // Optionally remove fields you do not need in the final response
                const { totalCountByBatch, ...filteredData } = summedData;
                const calculatedOee = this.calculateOee(summedData);
                return {
                    id: oeeId,
                    ...calculatedOee,
                    ...filteredData,
                };
            })
        );

        // Map the aggregated data into the expected response format
        const oeeStatusItems: OeeStatusItem[] = aggregatedData.map(item => ({
            id: item.id,
            oeeBatchId: 0,
            oeeCode: '',
            productionName: item.name,
            actual: item.totalCount,
            defect: item.totalAutoDefects + item.totalManualDefects,
            plan: 0,
            target: 0,
            oeePercent: item.oeePercent,
            lotNumber: '',
            batchStatus: '',
            startDate: new Date(),
            endDate: new Date(),
            useSitePercentSettings: 0, // ใช้ 0 แทน false
            percentSettings: [],
            standardSpeedSeconds: 0,
            productName: '',
            batchStartedDate: new Date(),
            batchStoppedDate: new Date(),
            activeSecondUnit: 0, // ใช้ 0 แทน false
          }));

        const rowsHourly: OeeRecord[] = await this.getOeeStatsByHour(oeeIds, advanceDto.from, advanceDto.to);

        const lossOees = await this.getLossOee(rowsHourly);


        return {
            lossOees,
            running,
            breakdown,
            ended,
            standby,
            mcSetup,
            oees: oeeStatusItems,
        } as OeeStatus;
    }

    async getLossOee(oeeRecords: OeeRecord[]): Promise<OeeLossGrouped[]> {
        // คำนวณ ALoss, PLoss, QLoss และจัดกลุ่มตาม oeeId
        const groupedData: Record<number, OeeLossResult[]> = oeeRecords.reduce((acc, record) => {
            const { aPercent, pPercent, qPercent, oeePercent } = record.data;
            const { oeeId, timeslot, timestamp } = record;

            const ALoss = (1 - (aPercent / 100)) * 100;
            const PLoss = ((aPercent / 100) - ((aPercent / 100) * (pPercent / 100))) * 100;
            const QLoss = (((aPercent / 100) * (pPercent / 100)) - ((aPercent / 100) * (pPercent / 100) * (qPercent / 100))) * 100;

            // จัดกลุ่มตาม oeeId
            if (!acc[oeeId]) {
                acc[oeeId] = [];
            }

            acc[oeeId].push({
                oeeId,
                id: record.id,
                oeePercent,
                ALoss,
                PLoss,
                QLoss,
                timeslot,
                timestamp
            });

            return acc;
        }, {} as Record<number, OeeLossResult[]>);

        return Object.keys(groupedData).map(key => ({
            oeeId: Number(key),
            lossResult: groupedData[key].sort((a, b) => new Date(a.timeslot).getTime() - new Date(b.timeslot).getTime()),
        }));
    }

    async getOeeStatsByHour(ids: number[], from: Date, to: Date): Promise<any> {
        if (!ids.length) {
            return [];
        }

        const firstTimeslotLabel = dayjs(from).format('YYYY-MM-DD HH:mm:ss');
        const firstPeriodEnd = dayjs(from).startOf('hour').add(1, 'hour').toDate();

        const middleStart = dayjs(from).startOf('hour').add(1, 'hour').toDate();
        const lastPeriodStart = dayjs(to).startOf('hour').toDate();

        const lastTimeslotLabel = dayjs(to).startOf('hour').format('YYYY-MM-DD HH:mm:ss');

        const query = `
          (
            SELECT 
              a.id, 
              a.data, 
              a.oeeId, 
              a.oeeBatchId, 
              a.productId, 
              a.timestamp, 
              ? AS timeslot
            FROM oeeBatchStats a
            INNER JOIN (
              SELECT 
                MAX(id) AS id, 
                oeeBatchId
              FROM oeeBatchStats
              WHERE 
                oeeId IN (${ids.join(', ')})
                AND timestamp >= ? 
                AND timestamp < ?
              GROUP BY oeeBatchId
            ) b ON a.id = b.id
          )
          UNION ALL
          (
            SELECT 
              a.id, 
              a.data, 
              a.oeeId, 
              a.oeeBatchId, 
              a.productId, 
              a.timestamp, 
              (timestamp - INTERVAL MOD(UNIX_TIMESTAMP(timestamp), 3600) SECOND) AS timeslot
            FROM oeeBatchStats a
            INNER JOIN (
              SELECT 
                MAX(id) AS id, 
                oeeBatchId, 
                (timestamp - INTERVAL MOD(UNIX_TIMESTAMP(timestamp), 3600) SECOND) AS timeslot
              FROM oeeBatchStats
              WHERE 
                oeeId IN (${ids.join(', ')})
                AND timestamp >= ? 
                AND timestamp < ?
              GROUP BY oeeBatchId, timeslot
            ) b ON a.id = b.id
          )
          UNION ALL
          (
            SELECT 
              a.id, 
              a.data, 
              a.oeeId, 
              a.oeeBatchId, 
              a.productId, 
              a.timestamp, 
              ? AS timeslot
            FROM oeeBatchStats a
            INNER JOIN (
              SELECT 
                MAX(id) AS id, 
                oeeBatchId
              FROM oeeBatchStats
              WHERE 
                oeeId IN (${ids.join(', ')})
                AND timestamp >= ? 
                AND timestamp <= ?
              GROUP BY oeeBatchId
            ) b ON a.id = b.id
          )
          ORDER BY timestamp, oeeBatchId;
        `;

        const parameters = [
            firstTimeslotLabel,
            from,
            firstPeriodEnd,


            middleStart,
            lastPeriodStart,


            lastTimeslotLabel,
            lastPeriodStart,
            to
        ];

        try {
            return await this.entityManager.query(query, parameters);
        } catch (error) {
            throw error;
        }
    }

    async getOeeStats(oeeIds: number[], startDate: Date, endDate: Date): Promise<OeeStats[]> {
        if (!oeeIds.length) {
            throw new Error('oeeIds array cannot be empty.');
        }

        const placeholders = this.generatePlaceholders(oeeIds.length);

        const query = `
            SELECT
                a.id,
                a.data,
                a.oeeId,
                a.oeeBatchId,
                a.productId,
                a.timestamp
            FROM
                oeeBatchStats a
            JOIN (
                SELECT
                    oeeBatchId,
                    MAX(id) AS max_id
                FROM
                    oeeBatchStats
                WHERE
                    timestamp BETWEEN ? AND ?
                    AND oeeId IN (${placeholders})
                GROUP BY
                    oeeBatchId
            ) b ON a.id = b.max_id;
        `;

        const parameters = [startDate, endDate, ...oeeIds];

        try {
            const result = await this.entityManager.query(query, parameters);
            return result.map(this.mapOeeStatsRow);
        } catch (error) {
            console.error('Failed to execute query:', error.message);
            console.error('Query:', query);
            console.error('Parameters:', parameters);
            throw new Error(`Failed to fetch OEE stats: ${error.message}`);
        }
    }

    private generatePlaceholders(count: number): string {
        return Array(count).fill('?').join(', ');
    }

    private mapOeeStatsRow(row: any): OeeStats {
        return {
            oeeBatchId: row.oeeBatchId,
            oeeId: row.oeeId,
            productId: row.productId,
            timestamp: row.timestamp,
            data: row.data, // Preserve raw data for further processing
        };
    }

    private async getOeeNames(rows: any[]): Promise<{ [key: number]: string }> {
        // Extract unique oeeIds from rows
        const oeeIds = Array.from(new Set(rows.map(row => row.oeeId).filter(id => id !== undefined)));

        if (oeeIds.length === 0) {
            return {}; // Return an empty object if no oeeIds are found
        }

        try {
            // Fetch OEE details
            const oees = await this.oeeRepository.find({
                where: { id: In(oeeIds) },
                select: ['id', 'productionName'], // Only fetch necessary fields
            });

            // Map OEE IDs to their production names
            return oees.reduce((acc, oee) => {
                acc[oee.id] = oee.productionName;
                return acc;
            }, {} as { [key: number]: string });
        } catch (error) {
            throw new Error(`Failed to fetch OEE names: ${error.message}`);
        }
    }

    private async sumOeeData(
        rows: any[],
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

        // Extract unique batch IDs from rows
        const batchIds = Array.from(new Set(rows.map((row) => row.oeeBatchId)));

        // Fetch OEE batch details for the given batch IDs
        const oeeBatches = await this.oeeBatchRepository.findBy({ id: In(batchIds) });

        // Reduce rows to accumulate OEE data
        return rows.reduce((acc, row) => {
            const { data, oeeBatchId } = row;
            const batch = oeeBatches.find((b) => b.id === oeeBatchId);

            const {
                runningSeconds = 0,
                operatingSeconds = 0,
                totalBreakdownSeconds = 0,
                plannedDowntimeSeconds = 0,
                machineSetupSeconds = 0,
                totalCount = 0,
                totalAutoDefects = 0,
                totalManualDefects = 0,
                totalOtherDefects = 0,
            } = data || {};

            // Update totalCountByBatch
            const totalCountByBatch = { ...acc.totalCountByBatch };
            if (totalCountByBatch[oeeBatchId]) {
                totalCountByBatch[oeeBatchId].totalCount += totalCount;
            } else {
                totalCountByBatch[oeeBatchId] = {
                    lotNumber: lotNumbers[oeeBatchId] || '',
                    standardSpeedSeconds: batch?.standardSpeedSeconds || 0,
                    totalCount,
                };
            }

            return {
                ...acc,
                name: names[row.oeeId] || '', // Use oeeId to get the name
                runningSeconds: acc.runningSeconds + runningSeconds,
                operatingSeconds: acc.operatingSeconds + operatingSeconds,
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

    private calculateOee(sumData: OeeSumData): any {
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
            aPercent: aPercent * 100,
            pPercent: pPercent * 100,
            qPercent: qPercent * 100,
            oeePercent: oeePercent * 100,
        };
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
}