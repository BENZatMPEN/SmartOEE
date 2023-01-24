import { Injectable } from '@nestjs/common';
import { CreateOeeBatchDto } from './dto/create-oee-batch.dto';
import { OeeBatchPlannedDowntimeDto } from './dto/oee-batch-planned-downtime.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { OeeEntity } from 'src/common/entities/oee-entity';
import { OeeBatchEntity } from '../common/entities/oee-batch-entity';
import { OeeMachineEntity } from '../common/entities/oee-machine-entity';
import { OeeProductEntity } from '../common/entities/oee-product-entity';
import * as dayjs from 'dayjs';
import { OeeBatchQEntity } from '../common/entities/oee-batch-q-entity';
import { OeeBatchPlannedDowntimeEntity } from '../common/entities/oee-batch-planned-downtime-entity';
import { OeeBatchAEntity } from '../common/entities/oee-batch-a-entity';
import { OeeBatchPEntity } from '../common/entities/oee-batch-p-entity';
import { UpdateOeeBatchADto } from './dto/update-oee-batch-a.dto';
import { initialOeeBatchStats, OeeStats } from '../common/type/oee-stats';
import { UpdateOeeBatchPDto } from './dto/update-oee-batch-p.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import {
  OEE_BATCH_STATUS_UNKNOWN,
  OEE_PARAM_TYPE_A,
  OEE_PARAM_TYPE_P,
  OEE_PARAM_TYPE_Q,
  OEE_TAG_OUT_RESET,
} from '../common/constant';
import { OeeBatchEditHistoryEntity } from '../common/entities/oee-batch-edit-history-entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FilterOeeBatchDto } from './dto/filter-oee-batch.dto';
import { initialOeeBatchMcState, OeeBatchMcState } from '../common/type/oee-status';
import { OeeBatchStatsTimelineEntity } from '../common/entities/oee-batch-stats-timeline-entity';
import { OeeBatchLogEntity } from '../common/entities/oee-batch-logs-entity';
import { OeeBatchStatsEntity } from '../common/entities/oee-batch-stats-entity';
import { OptionItem } from '../common/type/option-item';
import { fLotNumber } from '../common/utils/formatNumber';
import {
  AnalyticAParamUpdateEvent,
  AnalyticPParamUpdateEvent,
  AnalyticQParamUpdateEvent,
} from '../common/events/analytic.event';
import { AnalyticQParam } from '../common/type/analytic-data';
import { OeeTag, OeeTagOutReset } from '../common/type/oee-tag';
import { SocketService } from '../common/services/socket.service';

export type ParetoData = {
  labels: string[];
  counts: number[];
  percents: number[];
};

type CalculationItem = {
  key: number;
  count: number;
};

@Injectable()
export class OeeBatchService {
  constructor(
    @InjectRepository(OeeEntity)
    private readonly oeeRepository: Repository<OeeEntity>,
    @InjectRepository(OeeProductEntity)
    private readonly oeeProductRepository: Repository<OeeProductEntity>,
    @InjectRepository(OeeMachineEntity)
    private readonly oeeMachineRepository: Repository<OeeMachineEntity>,
    @InjectRepository(OeeBatchEntity)
    private readonly oeeBatchRepository: Repository<OeeBatchEntity>,
    @InjectRepository(OeeBatchAEntity)
    private readonly oeeBatchARepository: Repository<OeeBatchAEntity>,
    @InjectRepository(OeeBatchPEntity)
    private readonly oeeBatchPRepository: Repository<OeeBatchPEntity>,
    @InjectRepository(OeeBatchQEntity)
    private readonly oeeBatchQRepository: Repository<OeeBatchQEntity>,
    @InjectRepository(OeeBatchPlannedDowntimeEntity)
    private readonly oeeBatchPlannedDowntimeRepository: Repository<OeeBatchPlannedDowntimeEntity>,
    @InjectRepository(OeeBatchEditHistoryEntity)
    private readonly oeeBatchHistoryRepository: Repository<OeeBatchEditHistoryEntity>,
    @InjectRepository(OeeBatchStatsTimelineEntity)
    private readonly oeeBatchStatsTimelineRepository: Repository<OeeBatchStatsTimelineEntity>,
    @InjectRepository(OeeBatchStatsEntity)
    private readonly oeeBatchStatsRepository: Repository<OeeBatchStatsEntity>,
    @InjectRepository(OeeBatchLogEntity)
    private readonly oeeBatchLogRepository: Repository<OeeBatchLogEntity>,
    private readonly eventEmitter: EventEmitter2,
    private readonly entityManager: EntityManager,
    private readonly socketService: SocketService,
  ) {}

  async findPagedList(filterDto: FilterOeeBatchDto): Promise<PagedLisDto<OeeBatchEntity>> {
    const offset = filterDto.page == 0 ? 0 : filterDto.page * filterDto.rowsPerPage;
    const [rows, count] = await this.oeeBatchRepository
      .createQueryBuilder()
      .andWhere('siteId = :siteId', { siteId: filterDto.siteId })
      .andWhere('oeeId = :oeeId', { oeeId: filterDto.oeeId })
      .orderBy(`${filterDto.orderBy}`, filterDto.order === 'asc' ? 'ASC' : 'DESC')
      .skip(offset)
      .take(filterDto.rowsPerPage)
      .getManyAndCount();

    return { list: rows, count: count };
  }

  findByIdAndOeeId(id: number, oeeId: number): Promise<OeeBatchEntity> {
    return this.oeeBatchRepository.findOne({ where: { id, oeeId } });
  }

  findById(id: number): Promise<OeeBatchEntity> {
    return this.oeeBatchRepository.findOneBy({ id });
  }

  async findOptions(siteId: number): Promise<OptionItem[]> {
    const list = await this.oeeBatchRepository.find({
      select: ['id', 'startDate', 'product', 'lotNumber'],
      where: { siteId },
    });

    return list.map((item) => {
      const lotName: string[] = [];
      lotName.push(item.product.name);
      if (item.lotNumber) {
        lotName.push(item.lotNumber);
      }
      lotName.push(dayjs(item.startDate).format('DDMMYYYY'));
      lotName.push(fLotNumber(item.id));
      return { id: item.id, name: lotName.join('_') };
    });
  }

  async create(oeeId: number, createDto: CreateOeeBatchDto): Promise<OeeBatchEntity> {
    const { startDate, endDate, plannedQuantity, productId, lotNumber, planningId } = createDto;
    const oee = await this.oeeRepository.findOneBy({ id: oeeId });
    const oeeProduct = await this.oeeProductRepository.findOne({
      where: { oeeId: oeeId, productId: productId },
      relations: { product: true },
    });

    const oeeMachines = await this.oeeMachineRepository.find({
      where: { oeeId: oee.id },
      relations: ['machine', 'machine.parameters'],
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { remark, ...product } = oeeProduct.product;
    const machines = oeeMachines.map((oeeMachine) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { remark, ...machine } = oeeMachine.machine;
      return machine;
    });
    const processTimeSeconds = dayjs(endDate).diff(dayjs(startDate), 's');
    const targetQuantity = processTimeSeconds / oeeProduct.standardSpeedSeconds;
    const oeeBatch = await this.oeeBatchRepository.save({
      oeeId,
      lotNumber,
      plannedQuantity,
      targetQuantity,
      product,
      machines,
      planningId: planningId && planningId === -1 ? null : planningId,
      siteId: oee.siteId,
      status: OEE_BATCH_STATUS_UNKNOWN,
      minorStopSeconds: oee.minorStopSeconds,
      breakdownSeconds: oee.breakdownSeconds,
      standardSpeedSeconds: oeeProduct.standardSpeedSeconds,
      oeeStats: initialOeeBatchStats,
      mcState: initialOeeBatchMcState,
      startDate: startDate,
      endDate: endDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const qParams = oeeMachines
      .map((oeeMachine) => oeeMachine.machine)
      .map((machine) => machine.parameters.filter((param) => param.oeeType === 'q'))
      .flat();
    await this.oeeBatchQRepository.save(
      qParams.map((param) => {
        return {
          machineId: param.machineId,
          machineParameterId: param.id,
          tagId: param.tagId,
          amount: 0,
          oeeBatchId: oeeBatch.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }),
    );

    return oeeBatch;
  }

  async delete(id: number, siteId: number): Promise<void> {
    await this.oeeBatchRepository
      .createQueryBuilder()
      .delete()
      .where('id = :id and siteId = :siteId', { id, siteId })
      .execute();
  }

  async update(id: number, dto: any): Promise<void> {
    const updating = await this.oeeBatchRepository.findOneBy({ id });
    await this.oeeBatchQRepository.save({
      ...updating,
      ...dto,
      updatedAt: new Date(),
    });
  }

  async updateOeeStats(id: number, dto: any): Promise<void> {
    const updating = await this.oeeBatchRepository.findOneBy({ id });
    const { oeeStats } = updating;
    await this.oeeBatchRepository.save({
      ...updating,
      oeeStats: {
        ...oeeStats,
        ...dto,
      },
      updatedAt: new Date(),
    });

    // const calculateDto: OeeBatchCalculationDto = {
    //   oeeBatchId: batch.id,
    //   totalDefects: batch.oeeStats.totalAutoDefects,
    //   totalCount: batch.oeeStats.totalCount,
    // };
    // await this.oeeCalculationQueue.add('calculate', calculateDto);
  }

  async startBatch(id: number): Promise<Date> {
    const batchStartedDate = dayjs().startOf('s').toDate();
    const oeeBatch = await this.oeeBatchRepository.findOne({
      where: { id: id, batchStartedDate: IsNull(), batchStoppedDate: IsNull() },
      relations: ['oee'],
    });

    if (oeeBatch) {
      await this.oeeBatchRepository.save({
        id: oeeBatch.id,
        batchStartedDate,
        updatedAt: new Date(),
      });

      const tagOutRest = this.findOeeTag(oeeBatch.oee.tags, OEE_TAG_OUT_RESET);
      if (tagOutRest !== null) {
        const tagOutResetData: OeeTagOutReset = tagOutRest.data;
        this.socketService.socket.to(`site_${oeeBatch.siteId}`).emit(`tag_out`, {
          tagId: tagOutRest.tagId,
          value: tagOutResetData.reset,
        });
      }
    }

    return batchStartedDate;
  }

  private findOeeTag(oeeTags: OeeTag[], key: string): OeeTag {
    const itemIndex = oeeTags.findIndex((item) => item.key === key && item.tagId);
    if (itemIndex < 0) {
      return null;
    }
    return oeeTags[itemIndex];
  }

  async endBatch(id: number): Promise<void> {
    const oeeBatch = await this.findRunningBatchById(id);

    if (oeeBatch) {
      await this.oeeBatchRepository.save({
        ...oeeBatch,
        // status: OEE_BATCH_STATUS_ENDED,
        // batchStoppedDate: dayjs().startOf('s').toDate(),
        toBeStopped: true,
        updatedAt: new Date(),
      });
    }
  }

  async createPlannedDowntime(id: number, plannedDowntimeDto: OeeBatchPlannedDowntimeDto): Promise<void> {
    // const oeeBatch = await this.findRunningBatchById(id);
    //
    // if (oeeBatch) {
    //   await this.oeeBatchRepository.save({
    //     ...oeeBatch,
    //     // status: 'planned_downtime',
    //     updatedAt: new Date(),
    //   });
    // }

    await this.oeeBatchPlannedDowntimeRepository.save({
      ...plannedDowntimeDto,
      createdAt: dayjs().startOf('s').toDate(),
      updatedAt: new Date(),
    });
  }

  async findActivePlannedDowntimeById(id: number): Promise<OeeBatchPlannedDowntimeEntity> {
    return this.oeeBatchPlannedDowntimeRepository.findOne({
      where: { oeeBatchId: id, expiredAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  async expiredActivePlannedDowntime(id: number): Promise<void> {
    // const oeeBatch = await this.findRunningBatchById(id);

    // if (oeeBatch) {
    //   await this.oeeBatchRepository.save({
    //     ...oeeBatch,
    //     // status: 'running',
    //     updatedAt: new Date(),
    //   });
    // }

    const activePlannedDowntime = await this.oeeBatchPlannedDowntimeRepository.findOne({
      where: { oeeBatchId: id, expiredAt: IsNull() },
      order: { createdAt: 'DESC' },
    });

    if (activePlannedDowntime) {
      await this.oeeBatchPlannedDowntimeRepository.save({
        ...activePlannedDowntime,
        toBeExpired: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  findRunningBatchById(id: number): Promise<OeeBatchEntity> {
    return this.oeeBatchRepository
      .createQueryBuilder()
      .where('id = :id', { id })
      .andWhere('batchStartedDate IS NOT NULL AND batchStoppedDate IS NULL')
      .getOne();
  }

  // async findWorkingBatchByOeeId(oeeId: number): Promise<OeeBatch> {
  //   return this.oeeBatchRepository.findOne({
  //     where: { oeeId, batchStoppedDate: IsNull() },
  //     relations: {
  //       product: true,
  //     },
  //   });
  //   // test.aParams = [];
  //   // test.pParams = [];
  //   // test.qParams = [];
  //   // return test;
  //   // const oeeBatch = await this.oeeBatchRepository.findOne({
  //   //   include: [Product, OeeBatchA, OeeBatchP, OeeBatchQ],
  //   //   where: { oeeId: oeeId, batchStoppedDate: null },
  //   // });
  //   //
  //   // return oeeBatch;
  //   // return null;
  // }

  async findBatchAsById(id: number): Promise<OeeBatchAEntity[]> {
    return this.oeeBatchARepository.find({
      where: {
        oeeBatchId: id,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async updateBatchA(oeeBatchAId: number, updateDto: UpdateOeeBatchADto): Promise<OeeBatchAEntity> {
    const current = await this.oeeBatchARepository.findOneBy({ id: oeeBatchAId });
    const updating = {
      ...current,
      ...updateDto,
      updatedAt: new Date(),
    };

    const batch = await this.oeeBatchRepository.findOneBy({ id: current.oeeBatchId });
    const { siteId, oeeId, product } = batch;
    const analyticAParamsUpdateEvent: AnalyticAParamUpdateEvent = {
      siteId,
      oeeId,
      productId: product.id,
      oeeBatchId: batch.id,
      params: [
        {
          tagId: current.tagId,
          seconds: -current.seconds,
          machineId: current.machineId,
          machineParameterId: current.machineParameterId,
        },
        {
          tagId: updating.tagId,
          seconds: updating.seconds,
          machineId: updating.machineId,
          machineParameterId: updating.machineParameterId,
        },
      ],
    };
    await this.eventEmitter.emitAsync('analytic-a-params.update', analyticAParamsUpdateEvent);

    const batchA = await this.oeeBatchARepository.save(updating);
    await this.eventEmitter.emitAsync('batch-a-params.updated', { batchId: batchA.oeeBatchId, createLog: true });

    return batchA;
  }

  async findBatchPsById(id: number): Promise<OeeBatchPEntity[]> {
    return this.oeeBatchPRepository.findBy({
      oeeBatchId: id,
    });
  }

  async findBatchPsByIdAndMinorStop(id: number): Promise<OeeBatchPEntity[]> {
    return this.oeeBatchPRepository.find({
      where: {
        oeeBatchId: id,
        isSpeedLoss: false,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async updateBatchP(oeeBatchPId: number, updateDto: UpdateOeeBatchPDto): Promise<OeeBatchPEntity> {
    const current = await this.oeeBatchPRepository.findOneBy({ id: oeeBatchPId });
    const updating = {
      ...current,
      ...updateDto,
      updatedAt: new Date(),
    };

    const batch = await this.oeeBatchRepository.findOneBy({ id: current.oeeBatchId });
    const { siteId, oeeId, product } = batch;
    const analyticPParamsUpdateEvent: AnalyticPParamUpdateEvent = {
      siteId,
      oeeId,
      productId: product.id,
      oeeBatchId: batch.id,
      params: [
        {
          tagId: current.tagId,
          seconds: -current.seconds,
          machineId: current.machineId,
          machineParameterId: current.machineParameterId,
        },
        {
          tagId: updating.tagId,
          seconds: updating.seconds,
          machineId: updating.machineId,
          machineParameterId: updating.machineParameterId,
        },
      ],
    };
    await this.eventEmitter.emitAsync('analytic-p-params.update', analyticPParamsUpdateEvent);

    const batchP = await this.oeeBatchPRepository.save(updating);
    await this.eventEmitter.emitAsync('batch-p-params.updated', { batchId: batchP.oeeBatchId, createLog: true });

    return batchP;
  }

  async findBatchQsById(id: number): Promise<OeeBatchQEntity[]> {
    return this.oeeBatchQRepository.findBy({
      oeeBatchId: id,
    });
  }

  async updateBatchQs(id: number, updateDto: any /*UpdateOeeBatchPDto*/): Promise<void> {
    // calculate for analytic first
    const batch = await this.oeeBatchRepository.findOneBy({ id });
    const { siteId, oeeId, product, oeeStats } = batch;
    const currentParams = await this.oeeBatchQRepository
      .createQueryBuilder()
      .where('oeeBatchId = :oeeBatchId', { oeeBatchId: batch.id })
      .andWhere(`id IN (:...ids)`, { ids: updateDto.qParams.map((item) => item.id) })
      .getMany();

    const analyticQParams: AnalyticQParam[] = updateDto.qParams.map((updatingParam) => {
      const currentParam = currentParams.filter((item) => item.id === updatingParam.id)[0];
      return {
        autoAmount: 0,
        manualAmount:
          currentParam.manualAmount === 0 && updatingParam.manualAmount > 0
            ? updatingParam.manualAmount
            : updatingParam.manualAmount - currentParam.manualAmount,
        tagId: currentParam.tagId,
        machineId: currentParam.machineId,
        machineParameterId: currentParam.machineParameterId,
      };
    });

    // calculate q other
    const sumManual = updateDto.qParams.reduce((acc, x) => acc + x.manualAmount, 0);
    console.log('totalManual', updateDto.totalManual);
    console.log('sumManual', sumManual);

    const updatingOther = updateDto.totalManual - sumManual;
    console.log('updatingOther', updatingOther);
    const currentOther = oeeStats.totalOtherDefects; //currentParams.reduce((acc, x) => acc + x.manualAmount, 0);
    console.log('currentOther', currentOther);
    analyticQParams.push({
      autoAmount: 0,
      manualAmount: currentOther === 0 && updatingOther > 0 ? updatingOther : updatingOther - currentOther,
      tagId: null,
      machineId: null,
      machineParameterId: null,
    });

    const analyticQParamsUpdateEvent: AnalyticQParamUpdateEvent = {
      siteId,
      oeeId,
      productId: product.id,
      oeeBatchId: batch.id,
      params: analyticQParams,
    };
    await this.eventEmitter.emitAsync('analytic-q-params.update', analyticQParamsUpdateEvent);

    // then update the data
    await this.oeeBatchQRepository.save(
      updateDto.qParams.map((item) => {
        return {
          ...item,
          updatedAt: new Date(),
        };
      }),
    );

    await this.updateOeeStats(id, {
      totalManualDefects: updateDto.totalManual,
    });

    // const batch = await this.findById(id);
    // const calculateDto: OeeBatchCalculationDto = {
    //   oeeBatchId: batch.id,
    //   totalDefects: batch.oeeStats.totalAutoDefects,
    //   totalCount: batch.oeeStats.totalCount,
    // };
    //

    await this.eventEmitter.emitAsync('batch-q-params.updated', { batchId: id, createLog: true });
    // await this.oeeCalculationQueue.add('calculate', calculateDto);
  }

  createBatchHistory(id: number, type: string, data: any): Promise<OeeBatchEditHistoryEntity> {
    return this.oeeBatchHistoryRepository.save({
      type,
      data,
      oeeBatchId: id,
      createdAt: new Date(),
    });
  }

  async update1(id: number, dto: any): Promise<void> {
    await this.oeeBatchRepository.save({
      id,
      ...dto,
      updatedAt: new Date(),
    });
  }

  async updateMcState(id: number, mcState: OeeBatchMcState): Promise<void> {
    await this.oeeBatchRepository.save({
      id,
      mcState,
      updatedAt: new Date(),
    });
  }

  expireActivePlannedDowntime(plannedDowntime: OeeBatchPlannedDowntimeEntity): Promise<OeeBatchPlannedDowntimeEntity> {
    return this.oeeBatchPlannedDowntimeRepository.save({
      ...plannedDowntime,
      expiredAt: new Date(),
    });
  }

  findBatchPlannedDowntimesById(oeeBatchId: number): Promise<OeeBatchPlannedDowntimeEntity[]> {
    return this.oeeBatchPlannedDowntimeRepository.find({
      where: { oeeBatchId },
    });
  }

  async findWorkingBatchIdsBySiteId(siteId: number): Promise<number[]> {
    const rows = await this.entityManager.query(
      `select id from oeeBatches where siteId = ${siteId} and batchStoppedDate is null and batchStartedDate is not null;`,
    );
    return rows.map((row) => row.id);
  }

  async findWorkingSiteIds(): Promise<number[]> {
    const rows = await this.entityManager.query(
      'select distinct siteId from oeeBatches where batchStoppedDate is null;',
    );
    return rows.map((row) => row.siteId);
  }

  createBatchA(createDto: any): Promise<OeeBatchAEntity> {
    return this.oeeBatchARepository.save({ ...createDto, createdAt: new Date(), updatedAt: new Date() });
  }

  createBatchP(createDto: any): Promise<OeeBatchPEntity> {
    return this.oeeBatchPRepository.save({ ...createDto, createdAt: new Date(), updatedAt: new Date() });
  }

  updateBatchQ(updateDto: any): Promise<OeeBatchQEntity> {
    return this.oeeBatchQRepository.save({
      ...updateDto,
      updatedAt: new Date(),
    });
  }

  findBatchAByIdAndTagId(id: number, tagId: number): Promise<OeeBatchAEntity> {
    return this.oeeBatchARepository.findOne({ where: { oeeBatchId: id, tagId }, relations: ['machineParameter'] });
  }

  findBatchPByIdAndTagId(id: number, tagId: number): Promise<OeeBatchPEntity> {
    return this.oeeBatchPRepository.findOne({ where: { oeeBatchId: id, tagId }, relations: ['machineParameter'] });
  }

  findBatchQByIdAndTagId(id: number, tagId: number): Promise<OeeBatchQEntity> {
    return this.oeeBatchQRepository.findOne({ where: { oeeBatchId: id, tagId }, relations: ['machineParameter'] });
  }

  findBatchLatestTimeline(batchId: number): Promise<OeeBatchStatsTimelineEntity> {
    return this.oeeBatchStatsTimelineRepository.findOne({
      where: { oeeBatchId: batchId },
      order: { toDate: 'DESC' },
    });
  }

  async createBatchTimeline(batchId: number, status: string, date: Date): Promise<void> {
    const batch = await this.oeeBatchRepository.findOneBy({ id: batchId });
    await this.oeeBatchStatsTimelineRepository.save({
      oeeId: batch.oeeId,
      productId: batch.product.id,
      oeeBatchId: batchId,
      status,
      fromDate: date,
      toDate: date,
    });
  }

  async updateBatchTimeline(batchTimelineId: number, date: Date): Promise<void> {
    await this.oeeBatchStatsTimelineRepository.save({
      id: batchTimelineId,
      toDate: date,
    });
  }

  findBatchTimelinesByBatchId(batchId: number): Promise<OeeBatchStatsTimelineEntity[]> {
    return this.oeeBatchStatsTimelineRepository.find({
      where: {
        oeeBatchId: batchId,
      },
      order: { toDate: 'ASC' },
      select: ['status', 'fromDate', 'toDate'],
    });
  }

  async saveBatchStats(oeeId: number, productId: number, oeeBatchId: number, oeeStats: OeeStats, timestamp: Date) {
    const updatingStatsTime = await this.oeeBatchStatsRepository.findOneBy({
      oeeId,
      productId,
      oeeBatchId,
      timestamp,
    });

    const {
      aPercent,
      pPercent,
      qPercent,
      oeePercent,
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
    } = oeeStats;

    const statsTimeData = {
      aPercent,
      pPercent,
      qPercent,
      oeePercent,
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
    };

    if (updatingStatsTime) {
      await this.oeeBatchStatsRepository.save({
        ...updatingStatsTime,
        data: statsTimeData,
      });
    } else {
      await this.oeeBatchStatsRepository.save({
        oeeId,
        productId,
        oeeBatchId,
        timestamp,
        data: statsTimeData,
      });
    }
  }

  async findBatchStatsByBatchId(batchId: number, samplingSeconds: number): Promise<OeeBatchStatsEntity[]> {
    const rows = await this.entityManager.query(
      'select a.id, a.data, a.oeeId, a.oeeBatchId, a.productId, b.timeSlot as timestamp\n' +
        'from oeeBatchStats a\n' +
        '         inner join (select oeeBatchId,\n' +
        '                            max(timestamp) as maxTime,\n' +
        `                            (timestamp - interval MOD(UNIX_TIMESTAMP(timestamp), ${samplingSeconds}) second) as timeSlot\n` +
        '                     from oeeBatchStats\n' +
        `                     where oeeBatchId = ${batchId}\n` +
        `                     group by oeeBatchId, (timestamp - interval MOD(UNIX_TIMESTAMP(timestamp), ${samplingSeconds}) second)) b\n` +
        '                    on a.timestamp = b.maxTime\n' +
        `where a.oeeBatchId = ${batchId};`,
    );

    return rows;
  }

  async createBatchLog(batchId: number): Promise<void> {
    const batch = await this.oeeBatchRepository.findOneBy({ id: batchId });
    const timestamp = dayjs().startOf('s');
    const {
      oeeStats,
      product,
      lotNumber,
      standardSpeedSeconds,
      plannedQuantity,
      status: batchStatus,
      machines,
    } = batch;

    const mcParamAs = machines
      .map((machine) => machine.parameters.filter((param) => param.oeeType === OEE_PARAM_TYPE_A))
      .flat();
    const mcParamPs = machines
      .map((machine) => machine.parameters.filter((param) => param.oeeType === OEE_PARAM_TYPE_P))
      .flat();
    const mcParamQs = machines
      .map((machine) => machine.parameters.filter((param) => param.oeeType === OEE_PARAM_TYPE_Q))
      .flat();

    const childrenResult = await Promise.all([
      this.oeeBatchARepository.findBy({
        oeeBatchId: batch.id,
      }),
      this.oeeBatchPRepository.findBy({
        oeeBatchId: batch.id,
      }),
      this.oeeBatchQRepository.findBy({
        oeeBatchId: batch.id,
      }),
    ]);

    const batchParamAs = childrenResult[0];
    const batchParamPs = childrenResult[1];
    const batchParamQs = childrenResult[2];

    const aParams = mcParamAs.reduce((acc, mcParam) => {
      const key = `a_${mcParam.id}`;
      acc[key] = batchParamAs
        .filter(
          (batchParam) => batchParam.machineId === mcParam.machineId && batchParam.machineParameterId === mcParam.id,
        )
        .reduce((total, item) => total + item.seconds, 0);
      return acc;
    }, {});

    const pParams = mcParamPs.reduce((acc, mcParam) => {
      const key = `p_${mcParam.id}`;
      acc[key] = batchParamPs
        .filter(
          (batchParam) => batchParam.machineId === mcParam.machineId && batchParam.machineParameterId === mcParam.id,
        )
        .reduce((total, item) => total + item.seconds, 0);
      return acc;
    }, {});

    const qParams = mcParamQs.reduce((acc, mcParam) => {
      const key = `q_${mcParam.id}`;
      const batchParam = batchParamQs.filter(
        (batchParam) => batchParam.machineId === mcParam.machineId && batchParam.machineParameterId === mcParam.id,
      )[0];
      acc[key] = batchParam.autoAmount + batchParam.manualAmount;
      return acc;
    }, {});

    const oee = await this.oeeRepository.findOneBy({ id: batch.oeeId });
    const {
      runningSeconds,
      loadingSeconds,
      operatingSeconds,
      plannedDowntimeSeconds,
      totalBreakdownSeconds,
      totalCount,
      totalAutoDefects,
      oeePercent,
      aPercent,
      pPercent,
      qPercent,
      target,
      efficiency,
      pStopSeconds,
    } = oeeStats;

    await this.oeeBatchLogRepository.save({
      oeeId: batch.oeeId,
      productId: batch.product.id,
      oeeBatchId: batch.id,
      data: {
        date: timestamp.format('YYYY-MM-DD'),
        time: timestamp.format('HH:mm:ss'),
        productionName: oee.productionName,
        product: product.sku,
        lotNo: lotNumber,
        cycleTime: standardSpeedSeconds,
        totalAvailableTime: runningSeconds,
        loadingTime: loadingSeconds,
        operatingTime: operatingSeconds,
        plannedDowntime: plannedDowntimeSeconds,
        downtime: totalBreakdownSeconds,
        planned: plannedQuantity,
        target: target,
        actual: totalCount,
        diff: plannedQuantity - totalCount,
        efficiency: efficiency,
        totalProduct: totalCount,
        goodProduct: totalCount - totalAutoDefects,
        defectProduct: totalAutoDefects,
        batchStatus,
        pStopSeconds,
        oee: oeePercent,
        a: aPercent,
        p: pPercent,
        q: qPercent,
        ...aParams,
        ...pParams,
        ...qParams,
      },
      timestamp: timestamp.toDate(),
      createdAt: new Date(),
    });
  }

  findBatchLogsById(id: number): Promise<OeeBatchLogEntity[]> {
    return this.oeeBatchLogRepository.find({ where: { oeeBatchId: id } });
  }

  async calculateBatchParetoA(batchId: number): Promise<ParetoData> {
    const batch = await this.oeeBatchRepository.findOneBy({ id: batchId });
    const { machines } = batch;
    const batchParamAs = await this.oeeBatchARepository.findBy({
      oeeBatchId: batch.id,
    });

    const total = batchParamAs.reduce((acc, item) => acc + item.seconds, 0);
    const list = batchParamAs.reduce((acc, item) => {
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

    const params = machines.map((mc) => mc.parameters.filter((mcParam) => mcParam.oeeType === OEE_PARAM_TYPE_A)).flat();
    const labels = listFirstNine.map((item) => params.filter((param) => param.id === item.key)[0].name);
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

  async calculateBatchParetoP(batchId: number): Promise<ParetoData> {
    const batch = await this.oeeBatchRepository.findOneBy({ id: batchId });
    const { machines } = batch;
    const batchParamPs = await this.oeeBatchPRepository.findBy({
      oeeBatchId: batch.id,
      isSpeedLoss: false,
    });

    const total = batchParamPs.reduce((acc, item) => acc + item.seconds, 0);
    const list = batchParamPs.reduce((acc, item) => {
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

    const params = machines.map((mc) => mc.parameters.filter((mcParam) => mcParam.oeeType === OEE_PARAM_TYPE_P)).flat();
    const labels = listFirstNine.map((item) => params.filter((param) => param.id === item.key)[0].name);
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

  async calculateBatchParetoQ(batchId: number): Promise<ParetoData> {
    const batch = await this.oeeBatchRepository.findOneBy({ id: batchId });
    const { machines, oeeStats } = batch;
    const { totalAutoDefects, totalManualDefects, totalOtherDefects } = oeeStats;
    const batchParamQs = await this.oeeBatchQRepository.findBy({
      oeeBatchId: batch.id,
    });

    const total = totalAutoDefects + totalManualDefects;
    const listWithoutOther = batchParamQs
      .filter((item) => item.autoAmount + item.manualAmount > 0)
      .map((item) => {
        // const amount = item.autoAmount + item.manualAmount;
        return {
          key: item.machineParameterId || 0,
          count: item.autoAmount + item.manualAmount,
        } as CalculationItem;
      });

    if (listWithoutOther.length === 0) {
      return;
    }

    const sortedList = listWithoutOther.sort((a, b) => (b.count > a.count ? 1 : a.count > b.count ? -1 : 0));
    const listFirstNine = sortedList.slice(0, 9);
    const restOfTheList = sortedList.slice(9, sortedList.length);

    const params = machines.map((mc) => mc.parameters.filter((mcParam) => mcParam.oeeType === OEE_PARAM_TYPE_Q)).flat();
    const labels = listFirstNine.map((item) => params.filter((param) => param.id === item.key)[0].name);
    const finalList = [...listFirstNine];

    const otherAmount = totalOtherDefects + restOfTheList.reduce((sum, item) => sum + item.count, 0);
    if (otherAmount > 0) {
      const itemOther: CalculationItem = {
        key: 0,
        count: otherAmount,
      };

      labels.push('Other');
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
}
