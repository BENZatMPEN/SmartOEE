import { Injectable } from "@nestjs/common";
import { SiteEntity } from "src/common/entities/site.entity";
import { Advance } from "src/common/type/advance";
import { EntityManager, In, Repository } from "typeorm";
import { InjectRepository } from '@nestjs/typeorm';
import { OeeEntity } from "src/common/entities/oee.entity";
import { OeeBatchEntity } from "src/common/entities/oee-batch.entity";
import { ProductEntity } from "src/common/entities/product.entity";
import { UserEntity } from "src/common/entities/user.entity";
import { OeeStatus, OeeStatusItem } from '../common/type/oee-status';

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

    async findAll(
        siteId: number,
        startDate: string,
        endDate: string,
        userId: number,
        isStream: boolean
    ): Promise<OeeStatus> {

        const user = await this.userRepository.findOne({
            where: { id: userId }, // Provide the selection condition
            relations: ['oees'], // Include the related "oees" entity
        });

        const oees = await this.oeeRepository.findBy({ siteId, deleted: false });
        const oeeIds = oees.map(oee => oee.id);

        if (oeeIds.length === 0) {
            return {} as OeeStatus;
        }
        let rows: OeeStats[] = await this.getOeeStats(oeeIds, startDate, endDate);
        const names = await this.getOeeNames(rows);
        const lotNumbers = await this.getLotNumbers(rows);
        const groupByOeeId = rows.reduce((acc, row) => {
            if (!acc[row.oeeId]) {
                acc[row.oeeId] = [];
            }
            acc[row.oeeId].push(row);
            return acc;
        }, {} as { [key: number]: OeeStats[] });


        let sumRows = [];
        const sumRowsQuery = 'WITH cte AS (SELECT distinct b.oeeId,\n' +
            '                             first_value(b.id) over (partition by b.oeeId order by b.id desc) as batchId\n' +
            '             FROM oeeBatches AS b)\n' +
            'select ifnull(sum(if(status = "running", 1, 0)), 0)                       as running,\n' +
            '       ifnull(sum(if(status = "ended" or status is null, 1, 0)), 0)       as ended,\n' +
            '       ifnull(sum(if(status = "standby" or status = "planned", 1, 0)), 0) as standby,\n' +
            '       ifnull(sum(if(status = "mc_setup", 1, 0)), 0)                      as mcSetup,\n' +
            '       ifnull(sum(if(status = "breakdown", 1, 0)), 0)                     as breakdown\n' +
            'from oees o\n' +
            '         left join cte on o.id = cte.oeeId\n' +
            '         left join oeeBatches ob\n' +
            '                   on cte.batchId = ob.id\n' +
            'where o.siteId = ? and o.deleted = 0';
        if (user?.isAdmin === false) {
            rows = rows.filter((row) => user.oees.some((oee) => oee.id === row.oeeId));
            const oeeIds = rows.map((row) => row.oeeId);
            sumRows = await this.entityManager.query(sumRowsQuery + ' AND o.id IN (?)', [siteId, oeeIds]);
        } else {
            sumRows = await this.entityManager.query(sumRowsQuery, [siteId]);
        }

        const { running, ended, standby, breakdown, mcSetup } = sumRows[0];

        for (const oeeId in groupByOeeId) {
            const sumOee = await this.sumOeeData(groupByOeeId[oeeId], names, lotNumbers);
            const { totalCountByBatch, ...filteredSumOee } = sumOee;
            const calculateOee = this.calculateOee(sumOee);
            groupByOeeId[oeeId] = {
                ...calculateOee,
                ...filteredSumOee,
            };
        }

        const oeeStatusItems: OeeStatusItem[] = Object.keys(groupByOeeId).map((key) => {
            const row = groupByOeeId[key];
            return {
                id: parseInt(key),
                oeeBatchId: 0,
                oeeCode: '',
                productionName: row.name,
                actual: row.totalCount,
                defect: row.totalAutoDefects + row.totalManualDefects,
                plan: 0,
                target: 0,
                oeePercent: row.oeePercent,
                lotNumber: '',
                batchStatus: '',
                startDate: new Date(),
                endDate: new Date(),
                useSitePercentSettings: false,
                percentSettings: [],
                standardSpeedSeconds: 0,
                productName: '',
                batchStartedDate: new Date(),
                batchStoppedDate: new Date(),
                activeSecondUnit: false,
            };
         });

        return {
            running: running,
            breakdown: breakdown,
            ended: ended,
            standby: standby,
            mcSetup: mcSetup,
            oees: oeeStatusItems,
        } as OeeStatus;
    }

    async getOeeStats(oeeIds: number[], startDate: string, endDate: string): Promise<OeeStats[]> {
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