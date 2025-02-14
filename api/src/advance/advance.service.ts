import { Injectable } from "@nestjs/common";
import { SiteEntity } from "src/common/entities/site.entity";
import { Between, EntityManager, In, LessThan, MoreThan, Repository } from "typeorm";
import { InjectRepository } from '@nestjs/typeorm';
import { OeeEntity } from "src/common/entities/oee.entity";
import { OeeBatchEntity } from "src/common/entities/oee-batch.entity";
import { ProductEntity } from "src/common/entities/product.entity";
import { UserEntity } from "src/common/entities/user.entity";
import { OeeStatus, OeeStatusItem } from '../common/type/oee-status';
import { AdvanceReqDto } from "./dto/advance-req.dto";
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Interval, OeeRecord } from "src/common/type/advance";
import { OeeWorkTimeEntity } from "src/common/entities/oee-work-time.entity";
import { OeeBatchStatsEntity } from "src/common/entities/oee-batch-stats.entity";
import { AndonOeeEntity } from "src/common/entities/andon-oee.entity";
import { AndonColumnEntity } from "src/common/entities/andon-column.entity";
import { AndonResDto } from "./dto/andon-res.dto";
import { AndonUpdateColumnReqDto } from "./dto/andon-column-req.dto";

dayjs.extend(utc);

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
    intervalLabel: string;
    interval: Interval;
    timeslot: string;
}

interface OeeLossGrouped {
    oeeId: number;
    lossResult: OeeLossResult[];
}

interface CommonOeeData {
    aggregatedData: any[];
    oeeIds: number[];
    running: number;
    ended: number;
    standby: number;
    breakdown: number;
    mcSetup: number;
    user: any;
    statsRows: OeeStats[];
}

@Injectable()
export class AdvanceService {
    constructor(
        @InjectRepository(SiteEntity)
        private readonly siteRepository: Repository<SiteEntity>,
        @InjectRepository(OeeEntity)
        private readonly oeeRepository: Repository<OeeEntity>,
        @InjectRepository(OeeBatchStatsEntity)
        private readonly oeeBatchstats: Repository<OeeBatchStatsEntity>,
        @InjectRepository(OeeBatchEntity)
        private readonly oeeBatchRepository: Repository<OeeBatchEntity>,
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        @InjectRepository(OeeWorkTimeEntity)
        private readonly workTimeRepository: Repository<OeeWorkTimeEntity>,
        @InjectRepository(AndonOeeEntity)
        private readonly andonOeeRepository: Repository<AndonOeeEntity>,
        @InjectRepository(AndonColumnEntity)
        private readonly andonColumnRepository: Repository<AndonColumnEntity>,
        private readonly entityManager: EntityManager,
    ) { }

    async findAllOeeMode1(advanceDto: AdvanceReqDto, siteId: number): Promise<OeeStatus> {
        // Retrieve aggregated OEE data for the specified site.
        const commonData = await this.getCommonOeeData(advanceDto, siteId);

        // Destructure to extract necessary properties.
        const { running, breakdown, ended, standby, mcSetup, aggregatedData } = commonData;

        // Convert aggregated data into OEE status items.
        const oeeStatusItems = this.mapToOeeStatusItems(aggregatedData);

        // Return the consolidated OEE status.
        return {
            running,
            breakdown,
            ended,
            standby,
            mcSetup,
            oees: oeeStatusItems,
        };
    }

    async findAllOeeMode2(advanceDto: AdvanceReqDto, siteId: number): Promise<OeeStatus> {
        const commonData = await this.getCommonOeeData(advanceDto, siteId);

        const oeeStatusItems: OeeStatusItem[] = this.mapToOeeStatusItems(commonData.aggregatedData);

        // ดึงข้อมูลสถิติแบบรายชั่วโมงและคำนวณ lossOees สำหรับ mode2
        // const rowsHourly: OeeRecord[] = await this.getOeeStatsByCustomIntervals(commonData.oeeIds, advanceDto.from, advanceDto.to);
        const rowsHourly: OeeRecord[] = await this.getOeeStatsByCustomIntervals2(commonData.oeeIds, advanceDto.from, advanceDto.to);
        const lossOees = await this.getLossOee(rowsHourly);

        return {
            lossOees,
            running: commonData.running,
            breakdown: commonData.breakdown,
            ended: commonData.ended,
            standby: commonData.standby,
            mcSetup: commonData.mcSetup,
            oees: oeeStatusItems,
        } as OeeStatus;
    }

    async findAllTeepMode1(advanceDto: AdvanceReqDto, siteId: number): Promise<any> {
        const commonData = await this.getCommonOeeData(advanceDto, siteId);
        const oeeStatusItems: OeeStatusItem[] = this.mapToOeeStatusItems(commonData.aggregatedData);
        const fromDate = dayjs(advanceDto.from).toDate();
        const toDate = dayjs(advanceDto.to).toDate();

        console.log(`fromDate: ${fromDate}`);
        console.log(`toDate: ${toDate}`);
        console.log(`-------------------------`);

        // ใช้ TypeORM `find()` ค้นหาข้อมูล
        const oeeWorkTimes = await this.workTimeRepository.find({
            where: [
                { oeeId: 1, startDateTime: Between(fromDate, toDate) },
                { oeeId: 1, endDateTime: Between(fromDate, toDate) },
                { oeeId: 1, startDateTime: LessThan(fromDate), endDateTime: MoreThan(toDate) } // กรณีครอบคลุมทั้งช่วง
            ],
        });

        const from = dayjs(advanceDto.from).utc();
        const to = dayjs(advanceDto.to).utc();

        console.log(`from: ${from}`);
        console.log(`to: ${to}`);


        let totalMinutes = 0;

        for (const work of oeeWorkTimes) {
            // แปลงเป็น Dayjs Object
            const start = dayjs(work.startDateTime);
            const end = dayjs(work.endDateTime);

            // หาช่วงเวลาทำงานที่อยู่ในกรอบเวลา
            const validStart = start.isBefore(from) ? from : start;
            const validEnd = end.isAfter(to) ? to : end;

            // คำนวณเฉพาะช่วงที่อยู่ในกรอบเวลา
            if (validStart.isBefore(validEnd)) {
                totalMinutes += validEnd.diff(validStart, 'minute');
            }
        }

        // แปลงนาทีเป็น ชั่วโมง และ นาที
        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;

        console.log(`เวลาทำงานทั้งหมด: ${totalHours} ชั่วโมง ${remainingMinutes} นาที`);





        return oeeWorkTimes;
        // return {
        //     running: commonData.running,
        //     breakdown: commonData.breakdown,
        //     ended: commonData.ended,
        //     standby: commonData.standby,
        //     mcSetup: commonData.mcSetup,
        //     oees: oeeStatusItems,
        // } as OeeStatus;
    }

    async findAllAndons(advanceDto: AdvanceReqDto, siteId: number): Promise<AndonResDto> {
        // Retrieve common aggregated OEE data for the site.
        const commonData = await this.getCommonOeeData(advanceDto, siteId);

        // Map the aggregated data into an array of OeeStatusItem objects.
        const oeeStatusItems: OeeStatusItem[] = this.mapToOeeStatusItems(commonData.aggregatedData);

        // If there are any OEE status items, batch query the corresponding Andon data.
        if (oeeStatusItems.length > 0) {
            // Extract the list of OEE IDs from the status items.
            const oeeIds = oeeStatusItems.map(item => item.id);

            // Retrieve all Andon OEE records that match these IDs in a single query.
            const andonOees = await this.andonOeeRepository.find({
                where: { oeeId: In(oeeIds) },
            });

            // Build a lookup map of oeeId to groupName.
            const andonMap = andonOees.reduce((map: Record<number, string>, andonOee) => {
                map[andonOee.oeeId] = andonOee.groupName;
                return map;
            }, {});

            // Update each OEE status item with the groupName if available.
            oeeStatusItems.forEach(item => {
                if (andonMap[item.id]) {
                    item.groupName = andonMap[item.id];
                }
            });
        }

        //find andon columns
        const columns = await this.andonColumnRepository.find({ where: { siteId } });

        // Return the final aggregated OEE status.
        return {
            running: commonData.running,
            breakdown: commonData.breakdown,
            ended: commonData.ended,
            standby: commonData.standby,
            mcSetup: commonData.mcSetup,
            oees: oeeStatusItems,
            columns: columns,
        };
    }

    async updateAndons(andonColumnDto: AndonUpdateColumnReqDto): Promise<AndonColumnEntity[]> {
        const updatePromises = andonColumnDto.andonColumns.map(column =>
            this.andonColumnRepository.update(
                { id: column.id, siteId: andonColumnDto.siteId },
                {
                    columnName: column.columnName,
                    columnValue: column.columnValue,
                    columnOrder: column.columnOrder,
                    deleted: column.deleted,
                    updatedAt: new Date(),
                }
            )
        );

        await Promise.all(updatePromises);

        const updatedEntities = await this.andonColumnRepository.find({
            where: {
                siteId: andonColumnDto.siteId,
                deleted: false,
            },
            order: { columnOrder: "ASC" },
        });

        return updatedEntities;
    }

    private async getCommonOeeData(advanceDto: AdvanceReqDto, siteId: number): Promise<CommonOeeData> {
        // Retrieve the user along with its associated OEEs.
        const user = await this.userRepository.findOne({
            where: { id: advanceDto.userId },
            relations: ['oees'],
        });

        // Retrieve OEEs for the given site (only the id field is needed).
        const oees = await this.oeeRepository.find({
            select: ['id'],
            where: { siteId, deleted: false },
        });
        const oeeIds = oees.map(oee => oee.id);

        // Early return if there are no OEEs.
        if (oeeIds.length === 0) {
            return this.getDefaultCommonOeeData(user);
        }

        // Get stats, names, and lot numbers concurrently.
        let statsRows: OeeStats[] = await this.getOeeStatsNew(oeeIds, advanceDto.from, advanceDto.to);
        const [oeeNames, lotNumbers] = await Promise.all([
            this.getOeeNames(statsRows),
            this.getLotNumbers(statsRows),
        ]);

        // Group stats by OEE ID.
        const groupedStats = this.groupStatsByOeeId(statsRows);

        // Build the base SQL query and parameters.
        const queryParams: any[] = [siteId];
        let sumRowsQuery = this.buildSumRowsQuery();

        // If the user is not an admin, filter the stats and the SQL query accordingly.
        if (user && !user.isAdmin) {
            statsRows = statsRows.filter(row =>
                user.oees.some(userOee => userOee.id === row.oeeId)
            );
            const filteredOeeIds = statsRows.map(row => row.oeeId);

            // If no OEEs remain after filtering, return the default structure.
            if (filteredOeeIds.length === 0) {
                return this.getDefaultCommonOeeData(user);
            }

            queryParams.push(filteredOeeIds);
            sumRowsQuery += ' AND o.id IN (?)';
        }

        // Execute the SQL query to retrieve aggregated status counts.
        const sumRows: any[] = await this.entityManager.query(sumRowsQuery, queryParams);
        const { running, ended, standby, breakdown, mcSetup } = sumRows[0];

        // Process each group of OEE stats concurrently.
        const aggregatedData: any[] = [];

        for (const [oeeIdStr, oeeStats] of Object.entries(groupedStats)) {
            const oeeId = Number(oeeIdStr);

            // คำนวณข้อมูลรวมของ OEE สำหรับกลุ่มนี้
            const summedData = await this.sumOeeData(oeeStats, oeeNames, lotNumbers);

            // ลบ field ที่ไม่จำเป็นออก (เช่น totalCountByBatch)
            const { totalCountByBatch, ...filteredData } = summedData;

            // คำนวณค่า OEE จากข้อมูลที่รวมแล้ว
            const calculatedOee = this.calculateOee(summedData);

            aggregatedData.push({
                id: oeeId,
                ...calculatedOee,
                ...filteredData,
            });
        }

        return {
            aggregatedData,
            oeeIds,
            running,
            ended,
            standby,
            breakdown,
            mcSetup,
            user,
            statsRows,
        };
    }

    /**
     * Returns the default CommonOeeData object.
     */
    private getDefaultCommonOeeData(user: UserEntity): CommonOeeData {
        return {
            aggregatedData: [],
            oeeIds: [],
            running: 0,
            ended: 0,
            standby: 0,
            breakdown: 0,
            mcSetup: 0,
            user,
            statsRows: [],
        };
    }

    /**
     * Groups OEE stats by their oeeId.
     */
    private groupStatsByOeeId(statsRows: OeeStats[]): Record<number, OeeStats[]> {
        return statsRows.reduce((acc, row) => {
            if (!acc[row.oeeId]) {
                acc[row.oeeId] = [];
            }
            acc[row.oeeId].push(row);
            return acc;
        }, {} as Record<number, OeeStats[]>);
    }

    /**
     * Builds the base SQL query for aggregating OEE status counts.
     */
    private buildSumRowsQuery(): string {
        return `
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
    }

    private mapToOeeStatusItems(aggregatedData: any[]): OeeStatusItem[] {
        return aggregatedData.map(item => ({
            id: item.id,
            oeeBatchId: 0,
            oeeCode: '',
            productionName: item.name,
            actual: item.totalCount,
            defect: item.totalAutoDefects + item.totalManualDefects,
            plan: 0,
            target: 0,
            oeePercent: item.oeePercent,
            aPercent: item.aPercent,
            qPercent: item.qPercent,
            pPercent: item.pPercent,
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
    }

    async getLossOee(oeeRecords: OeeRecord[]): Promise<OeeLossGrouped[]> {
        // สร้าง object สำหรับเก็บข้อมูลที่จัดกลุ่มตาม oeeId
        const groupedData: Record<number, OeeLossResult[]> = {};

        // วน loop เพื่อคำนวณ ALoss, PLoss, QLoss และจัดกลุ่มข้อมูล
        for (const record of oeeRecords) {
            const { aPercent, pPercent, qPercent, oeePercent } = record.data;
            // ใช้ field id จาก record เป็น key ในการจัดกลุ่ม
            const { id, intervalLabel, interval } = record;

            // คำนวณ Loss ตามสูตร
            const ALoss = (1 - aPercent / 100) * 100;
            const PLoss = ((aPercent / 100) - (aPercent / 100) * (pPercent / 100)) * 100;
            const QLoss = ((aPercent / 100) * (pPercent / 100) - (aPercent / 100) * (pPercent / 100) * (qPercent / 100)) * 100;

            // ตรวจสอบว่ามีข้อมูลสำหรับ oeeId นี้อยู่แล้วหรือไม่ ถ้ายังไม่มีให้สร้าง array ใหม่
            if (!groupedData[id]) {
                groupedData[id] = [];
            }

            // Push ข้อมูลลงใน groupedData พร้อมเก็บ timeslot (ใช้ interval.start) เพื่อใช้ในการจัดเรียง
            groupedData[id].push({
                id: record.id,
                oeePercent,
                ALoss,
                PLoss,
                QLoss,
                intervalLabel,
                timeslot: interval.start, // ใช้เวลาที่เริ่มต้นของ interval สำหรับจัดเรียง
            });
        }

        // แปลง object ที่จัดกลุ่มมาเป็น array และจัดเรียง lossResult ของแต่ละ oeeId ตาม timeslot
        const result: OeeLossGrouped[] = Object.keys(groupedData).map((key) => {
            const oeeId = Number(key);
            const lossResult = groupedData[oeeId].sort(
                (a, b) => new Date(a.timeslot).getTime() - new Date(b.timeslot).getTime()
            );

            return {
                oeeId,
                lossResult,
            };
        });

        return result;
    }


    async getOeeStatsByCustomIntervals2(
        ids: number[],
        from: Date,
        to: Date,
    ): Promise<any[]> {
        if (!ids.length) {
            return [];
        }

        // 1. ดึงข้อมูลดิบทั้งหมดในช่วง [from, to]
        const query = `
          SELECT a.id, a.data, a.oeeId, a.oeeBatchId, a.productId, a.timestamp
          FROM oeeBatchStats a
          WHERE a.oeeId IN (${ids.join(',')})
            AND a.timestamp BETWEEN ? AND ?
          ORDER BY a.oeeBatchId, a.timestamp;
        `;
        const rows = await this.entityManager.query(query, [from, to]);

        // 2. จัดกลุ่มข้อมูลตาม oeeBatchId (หรืออาจจัดกลุ่มใหม่ตาม oeeId หากต้องการ)
        const batches: { [batchId: string]: any[] } = {};
        for (const row of rows) {
            const batchId = row.oeeBatchId;
            if (!batches[batchId]) {
                batches[batchId] = [];
            }
            batches[batchId].push(row);
        }

        // 3. สร้างช่วงเวลา (intervals) แบบไดนามิกจากค่า from และ to
        const fromDayjs: Dayjs = dayjs(from);
        const toDayjs: Dayjs = dayjs(to);
        const intervals = this.generateIntervals(fromDayjs, toDayjs);

        // 4. ประมวลผลแต่ละ batch และแต่ละ interval เพื่อคำนวณ delta
        //    ให้แน่ใจว่าคุณเก็บ oeeId ไว้ในผลลัพธ์
        const results: any[] = [];
        for (const batchId in batches) {
            const batchRows = batches[batchId];

            intervals.forEach(interval => {
                // กรองข้อมูลในช่วงเวลา (รวม boundary ด้วย '[]')
                const filtered = batchRows.filter(row =>
                    dayjs(row.timestamp).isBetween(interval.start, interval.end, undefined, '[]')
                );

                if (filtered.length > 0) {
                    // ใช้ค่าแรกและค่าล่าสุดในช่วงนั้นคำนวณ delta จาก cumulative data
                    const firstData = filtered[0].data;
                    const lastData = filtered[filtered.length - 1].data;

                    const delta = {
                        totalCount: lastData.totalCount - firstData.totalCount,
                        runningSeconds: lastData.runningSeconds - firstData.runningSeconds,
                        operatingSeconds: lastData.operatingSeconds - firstData.operatingSeconds,
                        totalAutoDefects: lastData.totalAutoDefects - firstData.totalAutoDefects,
                        totalStopSeconds: lastData.totalStopSeconds - firstData.totalStopSeconds,
                        totalOtherDefects: lastData.totalOtherDefects - firstData.totalOtherDefects,
                        totalManualDefects: lastData.totalManualDefects - firstData.totalManualDefects,
                        machineSetupSeconds: lastData.machineSetupSeconds - firstData.machineSetupSeconds,
                        totalBreakdownSeconds: lastData.totalBreakdownSeconds - firstData.totalBreakdownSeconds,
                        totalMinorStopSeconds: lastData.totalMinorStopSeconds - firstData.totalMinorStopSeconds,
                        totalSpeedLossSeconds: lastData.totalSpeedLossSeconds - firstData.totalSpeedLossSeconds,
                        plannedDowntimeSeconds: lastData.plannedDowntimeSeconds - firstData.plannedDowntimeSeconds,
                    };

                    // ในผลลัพธ์ให้เก็บ oeeId ด้วย (สมมุติว่า row มี field oeeId)
                    results.push({
                        oeeId: filtered[0].oeeId,
                        oeeBatchId: Number(batchId),
                        intervalLabel: `${interval.start.format('HH:mm')} - ${interval.end.format('HH:mm')}`,
                        interval: {
                            start: interval.start.toDate(),
                            end: interval.end.toDate(),
                        },
                        data: delta,
                    });
                }
            });
        }

        const groupResults = results.reduce((acc, curr) => {
            // สร้าง key จาก oeeId กับ intervalLabel
            const key = `${curr.oeeId}_${curr.intervalLabel}`;

            // ถ้า key ยังไม่มีใน accumulator ให้สร้าง array ใหม่และ push ค่าแรกเข้าไป
            if (!acc[key]) {
                acc[key] = [curr];
            } else {
                // ถ้ามี key อยู่แล้ว ให้ push ค่าใหม่เข้าไปใน array
                acc[key].push(curr);
            }

            return acc;
        }, {} as { [key: string]: any[] });

        // Process each aggregatedResults of OEE stats concurrently.
        const aggregatedResults: any[] = [];

        for (const key in groupResults) {
            const group = groupResults[key];
            const oeeId = group[0].oeeId;

            // คำนวณข้อมูลรวมของ OEE สำหรับกลุ่มนี้
            const summedData = await this.sumOeeData(group, [], []);

            // ลบ field ที่ไม่จำเป็นออก (เช่น totalCountByBatch)
            const { totalCountByBatch, ...filteredData } = summedData;

            // คำนวณค่า OEE จากข้อมูลที่รวมแล้ว
            const calculatedOee = this.calculateOee(summedData);

            aggregatedResults.push({
                id: oeeId,
                intervalLabel: group[0].intervalLabel,
                interval: group[0].interval,
                data: {
                    ...calculatedOee,
                    ...filteredData,
                }

            });
        }


        return Object.values(aggregatedResults);
    }


    async getOeeStatsByCustomIntervals(
        ids: number[],
        from: Date,
        to: Date,
    ): Promise<any[]> {
        if (!ids.length) {
            return [];
        }

        // 1. ดึงข้อมูลดิบทั้งหมดในช่วง [from, to]
        const query = `
          SELECT a.id, a.data, a.oeeId, a.oeeBatchId, a.productId, a.timestamp
          FROM oeeBatchStats a
          WHERE a.oeeId IN (${ids.join(',')})
            AND a.timestamp BETWEEN ? AND ?
          ORDER BY a.oeeBatchId, a.timestamp;
        `;
        const rows = await this.entityManager.query(query, [from, to]);

        // 2. จัดกลุ่มข้อมูลตาม oeeBatchId (รองรับกรณีมีหลาย batch)
        const batches: { [batchId: string]: any[] } = {};
        for (const row of rows) {
            const batchId = row.oeeBatchId;
            if (!batches[batchId]) {
                batches[batchId] = [];
            }
            batches[batchId].push(row);
        }

        // 3. สร้างช่วงเวลา (intervals) แบบไดนามิกจากค่า from และ to
        const fromDayjs: Dayjs = dayjs(from);
        const toDayjs: Dayjs = dayjs(to);
        const intervals = this.generateIntervals(fromDayjs, toDayjs);

        const results: any[] = [];
        // 4. สำหรับแต่ละ batch ในข้อมูลที่ดึงมา
        for (const batchId in batches) {
            const batchRows = batches[batchId];

            // สำหรับแต่ละช่วงเวลา (interval)
            intervals.forEach(interval => {
                // กรองข้อมูลที่มี timestamp อยู่ในช่วง interval (รวม boundary ด้วย '[]')
                const filtered = batchRows.filter(row =>
                    dayjs(row.timestamp).isBetween(interval.start, interval.end, undefined, '[]')
                );

                if (filtered.length > 0) {
                    // สมมุติว่าข้อมูลในคอลัมน์ data เป็น cumulative value
                    // โดยใช้ค่าแรกและค่าล่าสุดในช่วงนั้นมาคำนวณ delta
                    const firstData = filtered[0].data;
                    const lastData = filtered[filtered.length - 1].data;

                    const delta = {
                        totalCount: lastData.totalCount - firstData.totalCount,
                        runningSeconds: lastData.runningSeconds - firstData.runningSeconds,
                        operatingSeconds: lastData.operatingSeconds - firstData.operatingSeconds,
                        totalAutoDefects: lastData.totalAutoDefects - firstData.totalAutoDefects,
                        totalStopSeconds: lastData.totalStopSeconds - firstData.totalStopSeconds,
                        totalOtherDefects: lastData.totalOtherDefects - firstData.totalOtherDefects,
                        totalManualDefects: lastData.totalManualDefects - firstData.totalManualDefects,
                        machineSetupSeconds: lastData.machineSetupSeconds - firstData.machineSetupSeconds,
                        totalBreakdownSeconds: lastData.totalBreakdownSeconds - firstData.totalBreakdownSeconds,
                        totalMinorStopSeconds: lastData.totalMinorStopSeconds - firstData.totalMinorStopSeconds,
                        totalSpeedLossSeconds: lastData.totalSpeedLossSeconds - firstData.totalSpeedLossSeconds,
                        plannedDowntimeSeconds: lastData.plannedDowntimeSeconds - firstData.plannedDowntimeSeconds,
                    };

                    results.push({
                        oeeBatchId: batchId,
                        intervalLabel: `${interval.start.format('HH:mm')} - ${interval.end.format('HH:mm')}`,
                        interval: {
                            start: interval.start.toDate(),
                            end: interval.end.toDate(),
                        },
                        data: delta,
                    });
                }
            });
        }

        return results;
    }

    private generateIntervals(
        from: Dayjs,
        to: Dayjs,
    ): { start: Dayjs; end: Dayjs }[] {
        const intervals: { start: Dayjs; end: Dayjs }[] = [];
        let currentStart = from;

        // กรณี from ไม่ตรงกับจุดเริ่มต้นของชั่วโมง
        if (from.minute() !== 0 || from.second() !== 0 || from.millisecond() !== 0) {
            const firstIntervalEnd = from.endOf('hour');
            if (firstIntervalEnd.isAfter(to)) {
                // กรณีช่วงเวลาน้อยกว่า 1 ชั่วโมง
                intervals.push({ start: from, end: to });
                return intervals;
            } else {
                intervals.push({ start: from, end: firstIntervalEnd });
                // เริ่ม interval ถัดไปที่จุดเริ่มต้นของชั่วโมงถัดไป
                currentStart = from.startOf('hour').add(1, 'hour');
            }
        } else {
            currentStart = from;
        }

        // สร้างช่วงเต็มชั่วโมง
        while (
            currentStart.add(1, 'hour').isBefore(to) ||
            currentStart.add(1, 'hour').isSame(to)
        ) {
            intervals.push({ start: currentStart, end: currentStart.endOf('hour') });
            currentStart = currentStart.add(1, 'hour');
        }

        // ช่วงสุดท้าย (ถ้ายังมีเวลาที่เหลือ)
        if (currentStart.isBefore(to)) {
            intervals.push({ start: currentStart, end: to });
        }

        return intervals;
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


    private async getOeeStatsNew(oeeIds: number[], from: Date, to: Date): Promise<OeeStats[]> {
        if (!oeeIds.length) {
            throw new Error('oeeIds array cannot be empty.');
        }
        // Query ข้อมูลทั้งหมดในช่วงเวลาที่ระบุ โดยใช้ WHERE IN สำหรับ oeeId
        const stats = await this.oeeBatchstats.find({
            where: {
                oeeId: In(oeeIds),
                timestamp: Between(from, to),
            },
            // เรียงลำดับตาม oeeBatchId และ timestamp
            order: {
                oeeBatchId: 'ASC',
                timestamp: 'ASC',
            },
        });

        // Group ข้อมูลตาม oeeBatchId (หรือสามารถใช้ key เป็น `${oeeId}_${oeeBatchId}` หากต้องการแยกตาม oeeId ด้วย)
        const groupedStats = stats.reduce((acc, stat) => {
            const groupKey = stat.oeeBatchId;
            if (!acc[groupKey]) {
                acc[groupKey] = [];
            }
            acc[groupKey].push(stat);
            return acc;
        }, {});

        const result = [];

        // คำนวณความแตกต่างในแต่ละกลุ่ม
        for (const [oeeBatchId, records] of Object.entries(groupedStats)) {
            const recs = records as OeeBatchStatsEntity[];
            const firstRecord = recs[0];
            const lastRecord = recs[recs.length - 1];

            const data = {
                oeeId: firstRecord.oeeId,
                oeeBatchId: Number(oeeBatchId),
                productId: firstRecord.productId,
                firstTimestamp: firstRecord.timestamp,
                lastTimestamp: lastRecord.timestamp,
                data: {
                    totalCount: lastRecord.data.totalCount - firstRecord.data.totalCount,
                    runningSeconds: lastRecord.data.runningSeconds - firstRecord.data.runningSeconds,
                    operatingSeconds: lastRecord.data.operatingSeconds - firstRecord.data.operatingSeconds,
                    totalAutoDefects: lastRecord.data.totalAutoDefects - firstRecord.data.totalAutoDefects,
                    totalStopSeconds: lastRecord.data.totalStopSeconds - firstRecord.data.totalStopSeconds,
                    totalOtherDefects: lastRecord.data.totalOtherDefects - firstRecord.data.totalOtherDefects,
                    totalManualDefects: lastRecord.data.totalManualDefects - firstRecord.data.totalManualDefects,
                    machineSetupSeconds: lastRecord.data.machineSetupSeconds - firstRecord.data.machineSetupSeconds,
                    totalBreakdownSeconds: lastRecord.data.totalBreakdownSeconds - firstRecord.data.totalBreakdownSeconds,
                    totalMinorStopSeconds: lastRecord.data.totalMinorStopSeconds - firstRecord.data.totalMinorStopSeconds,
                    totalSpeedLossSeconds: lastRecord.data.totalSpeedLossSeconds - firstRecord.data.totalSpeedLossSeconds,
                    plannedDowntimeSeconds: lastRecord.data.plannedDowntimeSeconds - firstRecord.data.plannedDowntimeSeconds,
                },
            };
            result.push(data);
        }

        return result;
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

        let accumulator = initSum;

        for (const row of rows) {
            const { data, oeeBatchId } = row;
            const batch = oeeBatches.find((b) => b.id === oeeBatchId);

            // ดึงข้อมูลจาก data โดยกำหนดค่าเริ่มต้นเป็น 0 หากไม่มีข้อมูล
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

            // อัปเดต totalCountByBatch โดยทำการ clone ค่าปัจจุบัน
            const totalCountByBatch = { ...accumulator.totalCountByBatch };
            if (totalCountByBatch[oeeBatchId]) {
                totalCountByBatch[oeeBatchId].totalCount += totalCount;
            } else {
                totalCountByBatch[oeeBatchId] = {
                    lotNumber: lotNumbers[oeeBatchId] || '',
                    standardSpeedSeconds: batch?.standardSpeedSeconds || 0,
                    totalCount,
                };
            }

            // อัปเดต accumulator ด้วยการบวกค่าใหม่จาก row ปัจจุบัน
            accumulator = {
                ...accumulator,
                name: names[row.oeeId] || '', // ใช้ oeeId เพื่อดึงชื่อ
                runningSeconds: accumulator.runningSeconds + runningSeconds,
                operatingSeconds: accumulator.operatingSeconds + operatingSeconds,
                totalBreakdownSeconds: accumulator.totalBreakdownSeconds + totalBreakdownSeconds,
                plannedDowntimeSeconds: accumulator.plannedDowntimeSeconds + plannedDowntimeSeconds,
                machineSetupSeconds: accumulator.machineSetupSeconds + machineSetupSeconds,
                totalCount: accumulator.totalCount + totalCount,
                totalAutoDefects: accumulator.totalAutoDefects + totalAutoDefects,
                totalManualDefects: accumulator.totalManualDefects + totalManualDefects,
                totalOtherDefects: accumulator.totalOtherDefects + totalOtherDefects,
                totalCountByBatch,
            };
        }

        return accumulator;

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