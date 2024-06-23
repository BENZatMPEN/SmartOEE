import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOeeDto } from './dto/create-oee.dto';
import { FilterOeeDto } from './dto/filter-oee.dto';
import { UpdateOeeDto } from './dto/update-oee.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { OeeEntity } from 'src/common/entities/oee.entity';
import { OeeProductEntity } from 'src/common/entities/oee-product.entity';
import { OeeMachineEntity } from 'src/common/entities/oee-machine.entity';
import { OeeBatchEntity } from '../common/entities/oee-batch.entity';
import { OeeStatus, OeeStatusItem } from '../common/type/oee-status';
import { initialOeeBatchStats } from '../common/type/oee-stats';
import { OptionItem } from '../common/type/option-item';
import { SiteEntity } from '../common/entities/site.entity';
import { FileService } from '../common/services/file.service';
import { PlanningEntity } from '../common/entities/planning.entity';
import * as dayjs from 'dayjs';
import { FindLatestBatchOeeDto } from './dto/lastBatch-oee.dto';
import { UserEntity } from 'src/common/entities/user.entity';
import { OeeMachinePlannedDowntimeEntity } from 'src/common/entities/oee-machine-planned-downtime.entity';
import { OeeBatchPlannedDowntimeEntity } from 'src/common/entities/oee-batch-planned-downtime.entity';

@Injectable()
export class OeeService {
  constructor(
    @InjectRepository(OeeEntity)
    private readonly oeeRepository: Repository<OeeEntity>,
    @InjectRepository(OeeProductEntity)
    private readonly oeeProductRepository: Repository<OeeProductEntity>,
    @InjectRepository(OeeMachineEntity)
    private readonly oeeMachineRepository: Repository<OeeMachineEntity>,
    @InjectRepository(OeeBatchEntity)
    private readonly oeeBatchRepository: Repository<OeeBatchEntity>,
    @InjectRepository(SiteEntity)
    private siteRepository: Repository<SiteEntity>,
    @InjectRepository(PlanningEntity)
    private planningRepository: Repository<PlanningEntity>,
    @InjectRepository(OeeMachinePlannedDowntimeEntity)
    private oeeMachinePlannedDowntimeRepository: Repository<OeeMachinePlannedDowntimeEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(OeeBatchPlannedDowntimeEntity)
    private readonly oeeBatchPlannedDowntimeRepository: Repository<OeeBatchPlannedDowntimeEntity>,
    private readonly entityManager: EntityManager,
    private readonly fileService: FileService,
  ) { }

  async findPagedList(filterDto: FilterOeeDto): Promise<PagedLisDto<OeeEntity>> {
    const offset = filterDto.page == 0 ? 0 : filterDto.page * filterDto.rowsPerPage;
    const [rows, count] = await this.oeeRepository
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.oeeMachines', 'oom')
      .leftJoinAndSelect('oom.machine', 'oomm')
      .where('o.deleted = false')
      .andWhere('o.siteId = :siteId', { siteId: filterDto.siteId })
      .andWhere('(:search is null or o.oeeCode like :search or o.oeeType like :search or o.location like :search)', {
        search: filterDto.search ? `%${filterDto.search}%` : null,
      })
      .orderBy(`o.${filterDto.orderBy}`, filterDto.order === 'asc' ? 'ASC' : 'DESC')
      .skip(offset)
      .take(filterDto.rowsPerPage)
      .getManyAndCount();

    return { list: rows, count: count };
  }

  findAll(siteId: number): Promise<OeeEntity[]> {
    return this.oeeRepository.findBy({ siteId, deleted: false });
  }

  async findOptions(siteId: number): Promise<OptionItem[]> {
    const list = await this.oeeRepository.find({
      select: ['id', 'productionName'],
      where: { siteId, deleted: false },
    });

    return list.map((item) => ({ id: item.id, name: item.productionName }));
  }

  async findAllStatus(siteId: number, userId?: number): Promise<OeeStatus> {
    //find user by id
    const user = await this.userRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.oees', 'o')
      .where('u.id = :userId', { userId })
      .andWhere('o.deleted = false')
      .getOne();

    let rows = await this.entityManager.query(
      'WITH cte AS (SELECT distinct b.oeeId,\n' +
      '                             first_value(b.id) over (partition by b.oeeId order by b.id desc) as batchId\n' +
      '             FROM oeeBatches AS b)\n' +
      'select o.id,\n' +
      '       o.oeeCode,\n' +
      '       o.productionName,\n' +
      '       o.useSitePercentSettings,\n' +
      '       o.percentSettings,\n' +
      '       ob.startDate,\n' +
      '       ob.endDate,\n' +
      '       ob.lotNumber,\n' +
      '       ob.plannedQuantity,\n' +
      '       ob.standardSpeedSeconds,\n' +
      '       ob.oeeStats,\n' +
      '       ob.status,\n' +
      '       ob.id as oeeBatchId,\n' +
      '       ob.product,\n' +
      '       ob.batchStartedDate,\n' +
      '       ob.batchStoppedDate,\n' +
      '       o.activeSecondUnit\n' +
      'from oees o\n' +
      '         left join cte on o.id = cte.oeeId\n' +
      '         left join oeeBatches ob\n' +
      '                   on cte.batchId = ob.id\n' +
      'where o.siteId = ? and o.deleted = false',
      [siteId],
    );
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
      rows = rows.filter((row) => user.oees.some((oee) => oee.id === row.id));
      const oeeIds = rows.map((row) => row.id);
      sumRows = await this.entityManager.query(sumRowsQuery + ' AND o.id IN (?)', [siteId, oeeIds]);
    } else {
      sumRows = await this.entityManager.query(sumRowsQuery, [siteId]);
    }

    const { running, ended, standby, breakdown, mcSetup } = sumRows[0];

    return {
      running: running,
      breakdown: breakdown,
      ended: ended,
      standby: standby,
      mcSetup: mcSetup,
      oees: rows.map((row) => {
        const {
          id,
          oeeCode,
          productionName,
          lotNumber,
          status,
          standardSpeedSeconds,
          plannedQuantity,
          startDate,
          endDate,
          oeeStats,
          useSitePercentSettings,
          percentSettings,
          oeeBatchId,
          product,
          batchStartedDate,
          batchStoppedDate,
          activeSecondUnit,
        } = row;
        const { oeePercent, totalCount, target } = oeeStats || initialOeeBatchStats;

        return {
          id: id,
          oeeBatchId: oeeBatchId,
          oeeCode: oeeCode,
          productionName: productionName,
          actual: totalCount,
          plan: plannedQuantity,
          target: target,
          oeePercent: oeePercent,
          lotNumber: lotNumber,
          batchStatus: status,
          startDate: startDate,
          endDate: endDate,
          useSitePercentSettings: useSitePercentSettings,
          percentSettings: percentSettings,
          standardSpeedSeconds: standardSpeedSeconds,
          productName: product?.name || '',
          batchStartedDate: batchStartedDate,
          batchStoppedDate: batchStoppedDate,
          activeSecondUnit: activeSecondUnit,
        } as OeeStatusItem;
      }),
    } as OeeStatus;
  }

  async findByIdIncludingDetails(id: number, siteId: number): Promise<OeeEntity> {
    let oee = await this.oeeRepository.createQueryBuilder('oee')
      .where('oee.id = :id', { id })
      .andWhere('oee.siteId = :siteId', { siteId })
      .andWhere('oee.deleted = :deleted', { deleted: false })
      .leftJoinAndSelect('oee.oeeProducts', 'oeeProducts')
      .leftJoinAndSelect('oeeProducts.product', 'product')
      .leftJoinAndSelect('oee.oeeMachines', 'oeeMachines')
      .leftJoinAndSelect('oee.operators', 'operators')
      .leftJoinAndSelect('oeeMachines.machine', 'machine')
      .leftJoinAndSelect('machine.parameters', 'parameters')
      .leftJoinAndSelect('oee.oeeMachinePlannedDowntime', 'oeeMachinePlannedDowntime', 'oeeMachinePlannedDowntime.deleted = :downtimeDeleted', { downtimeDeleted: false })
      .getOne();

    oee.oeeMachines = oee.oeeMachines.map(machine => {
      machine.oeeMachinePlannedDowntime = oee.oeeMachinePlannedDowntime.filter(downtime => downtime.oeeId === machine.oeeId && downtime.oeeMachineId === machine.id);
      return machine;
    });

    return oee;
    // return this.oeeRepository.findOne({
    //   include: [
    //     {
    //       model: OeeProduct,
    //       include: [Product],
    //     },
    //     {
    //       model: OeeMachine,
    //       include: [
    //         {
    //           model: Machine,
    //           include: [MachineParameter],
    //         },
    //       ],
    //     },
    //   ],
    //   where: { id, deleted: false },
    // });
    // return null;
  }

  findByOeeCode(oeeCode: string, siteId: number): Promise<OeeEntity> {
    return this.oeeRepository.findOne({
      where: { oeeCode, siteId, deleted: false },
      relations: ['oeeProducts', 'oeeProducts.product'],
    });
  }

  findByIdIncludingProducts(id: number): Promise<OeeProductEntity[]> {
    return this.oeeProductRepository.find({ where: { oeeId: id }, relations: { product: true } });
  }

  findByIdIncludingMachines(id: number): Promise<OeeMachineEntity[]> {
    return this.oeeMachineRepository.find({
      where: { oeeId: id },
      relations: ['machine', 'machine.parameters'],
    });
  }

  async findLatestBatch(id: number, siteId: number): Promise<FindLatestBatchOeeDto> {
    const oeeBatch: OeeBatchEntity = await this.oeeBatchRepository.findOne({ where: { oeeId: id, siteId: siteId }, order: { createdAt: 'DESC' } });
    if (!oeeBatch) {
      return null;
    }

    const { ...batchWithoutOperator } = oeeBatch;
    const findLatestBatchOeeDto: FindLatestBatchOeeDto = {
      ...batchWithoutOperator,
      operator: null,
    };

    if (findLatestBatchOeeDto.operatorId) {
      const operator = await this.userRepository.findOne({ where: { id: findLatestBatchOeeDto.operatorId } });
      findLatestBatchOeeDto.operator = operator;
    }

    return findLatestBatchOeeDto;
  }

  findById(id: number): Promise<OeeEntity> {
    return this.oeeRepository.findOne({
      where: { id, deleted: false },
    });
  }

  async create(createDto: CreateOeeDto, imageName: string, siteId: number): Promise<OeeEntity> {
    const site = await this.siteRepository.findOneBy({ id: siteId });
    const countOee = await this.oeeRepository.countBy({ siteId: site.id });
    if (site.oeeLimit > -1 && countOee >= site.oeeLimit) {
      throw new BadRequestException(`Number of OEE has reached the limit (${site.oeeLimit})`);
    }

    const { oeeProducts, oeeMachines, ...dto } = createDto;
    if (site.mcLimit > -1 && oeeMachines.length > site.mcLimit) {
      throw new BadRequestException(`Number of M/C has reached the limit (${site.mcLimit})`);
    }
    //find operators by ids
    const operators = await this.userRepository.findBy({ id: In(createDto.operators?.map((item: any) => item.id) || []) });

    const oee = await this.oeeRepository.save({
      ...dto,
      imageName,
      operators,
      siteId: site.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (oeeProducts) {
      for (const product of oeeProducts) {
        const { id, ...productDto } = product;
        await this.oeeProductRepository.save({
          ...productDto,
          oeeId: oee.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    if (oeeMachines) {
      for (const machine of oeeMachines) {
        const { id, oeeMachinePlannedDowntime, ...machineDto } = machine;
        const oeeMachineResult = await this.oeeMachineRepository.save({
          ...machineDto,
          oeeId: oee.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        for (const item of oeeMachinePlannedDowntime) {
          //find planned downtime by id
          const plannedDowntime = await this.oeeBatchPlannedDowntimeRepository.findOneBy({ id: item.id });
          await this.oeeMachinePlannedDowntimeRepository.save({
            oeeId: oee.id,
            oeeMachineId: oeeMachineResult.id,
            plannedDownTimeId: item.plannedDownTimeId,
            plannedDownTimeName: plannedDowntime.name || '',
            fixTime: item.fixTime,
            startDate: item.startDate,
            endDate: item.endDate,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
    }
    return oee;
  }

  async update(id: number, updateDto: UpdateOeeDto, imageName: string, siteId: number): Promise<OeeEntity> {
    const site = await this.siteRepository.findOneBy({ id: siteId });
    const { oeeProducts, oeeMachines, ...dto } = updateDto;
    if (site.mcLimit > -1 && oeeMachines.length > site.mcLimit) {
      throw new BadRequestException(`Number of M/C has reached the limit (${site.mcLimit})`);
    }

    const updatingOee = await this.oeeRepository.findOneBy({ id, siteId });
    const { imageName: existingImageName } = updatingOee;
    if (imageName && existingImageName) {
      await this.fileService.deleteFile(existingImageName);
    }

    //find operators by ids
    const operators = await this.userRepository.findBy({ id: In(updateDto.operators?.map((item: any) => item.id) || []) });

    const oee = await this.oeeRepository.save({
      ...updatingOee,
      ...dto,
      operators,
      imageName: !imageName ? existingImageName : imageName,
      updatedAt: new Date(),
    });

    const deletingProductIds = (oeeProducts || [])
      .filter((oeeProduct) => oeeProduct.id)
      .map((oeeProduct) => oeeProduct.id);

    if (deletingProductIds.length > 0) {
      await this.oeeProductRepository
        .createQueryBuilder()
        .delete()
        .where('oeeId = :oeeId', { oeeId: oee.id })
        .andWhere('id not in (:ids)', { ids: deletingProductIds })
        .execute();
    } else {
      await this.oeeProductRepository
        .createQueryBuilder()
        .delete()
        .where('oeeId = :oeeId', { oeeId: oee.id })
        .execute();
    }

    const deletingMachineIds = (oeeMachines || [])
      .filter((oeeMachine) => oeeMachine.id)
      .map((oeeMachine) => oeeMachine.id);

    if (deletingMachineIds.length > 0) {
      await this.oeeMachineRepository
        .createQueryBuilder()
        .delete()
        .where('oeeId = :oeeId', { oeeId: oee.id })
        .andWhere('id not in (:ids)', { ids: deletingMachineIds })
        .execute();
    } else {
      await this.oeeMachineRepository
        .createQueryBuilder()
        .delete()
        .where('oeeId = :oeeId', { oeeId: oee.id })
        .execute();
    }

    if (oeeProducts) {
      for (const oeeProduct of oeeProducts) {
        if (oeeProduct.id) {
          const updatingProduct = await this.oeeProductRepository.findOneBy({ id: oeeProduct.id });
          await this.oeeProductRepository.save({ ...updatingProduct, ...oeeProduct, updatedAt: new Date() });
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...oeeProductDto } = oeeProduct;
          await this.oeeProductRepository.save({
            ...oeeProductDto,
            oeeId: oee.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        // const count = await this.oeeProductRepository.count({
        //   where: { [Op.and]: [{ oeeId: oee.id }, { productId: oeeProduct.productId }] },
        // });
        //
        // if (count === 0) {
        //   await this.oeeProductRepository.create({
        //     oeeId: oee.id,
        //     ...oeeProduct,
        //   });
        // } else {
        //   await this.oeeProductRepository.update(
        //     { ...oeeProduct },
        //     {
        //       where: {
        //         [Op.and]: [{ oeeId: oee.id }, { productId: oeeProduct.productId }],
        //       },
        //     },
        //   );
        // }
      }
    }

    if (oeeMachines) {
      for (const oeeMachine of oeeMachines) {
        if (oeeMachine.id) {
          const { oeeMachinePlannedDowntime, ...oeeMachineDto } = oeeMachine;
          const updatingMachine = await this.oeeProductRepository.findOneBy({ id: oeeMachine.id });
          await this.oeeMachineRepository.save({ ...updatingMachine, ...oeeMachineDto, updatedAt: new Date() });

          const oeeMachinePlannedDowntimes = await this.oeeMachinePlannedDowntimeRepository.findBy({ oeeId: oee.id, oeeMachineId: oeeMachine.id });
          //update delete planned downtime
          const deletingPlanDowntimeIds = oeeMachinePlannedDowntimes
            .filter((item) => !oeeMachinePlannedDowntime.some((downtime) => downtime.id === item.id))
            .map((item) => item.id);
          if (deletingPlanDowntimeIds.length > 0) {
            await this.oeeMachinePlannedDowntimeRepository
              .createQueryBuilder()
              .update()
              .set({ deleted: true, updatedAt: new Date() })
              .where('id in (:ids)', { ids: deletingPlanDowntimeIds })
              .execute();
          }

          for (const item of oeeMachinePlannedDowntime) {
            if (item.id) {
              const updatingPlanDowntime = await this.oeeMachinePlannedDowntimeRepository.findOneBy({ id: item.id });
              await this.oeeMachinePlannedDowntimeRepository.save({ ...updatingPlanDowntime, ...item, updatedAt: new Date() });
            } else {
              //find planned downtime by id
              const plannedDowntime = await this.oeeBatchPlannedDowntimeRepository.findOneBy({ id: item.id });
              await this.oeeMachinePlannedDowntimeRepository.save({
                oeeId: oee.id,
                oeeMachineId: oeeMachine.id,
                plannedDownTimeId: item.plannedDownTimeId,
                plannedDownTimeName: plannedDowntime.name || '',
                fixTime: item.fixTime,
                startDate: item.startDate,
                endDate: item.endDate,
                createdAt: new Date(),
                updatedAt: new Date(),
              });
            }
          }
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, oeeMachinePlannedDowntime, ...oeeMachineDto } = oeeMachine;
          const oeeMachineResult = await this.oeeMachineRepository.save({
            ...oeeMachineDto,
            oeeId: oee.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          for (const item of oeeMachinePlannedDowntime) {
            //find planned downtime by id
            const plannedDowntime = await this.oeeBatchPlannedDowntimeRepository.findOneBy({ id: item.id });
            await this.oeeMachinePlannedDowntimeRepository.save({
              oeeId: oee.id,
              oeeMachineId: oeeMachineResult.id,
              plannedDownTimeId: item.plannedDownTimeId,
              plannedDownTimeName: plannedDowntime.name || '',
              fixTime: item.fixTime,
              startDate: item.startDate,
              endDate: item.endDate,
              deleted: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        }

        //   const count = await this.oeeMachineRepository.count({
        //     where: { [Op.and]: [{ oeeId: oee.id }, { machineId: oeeMachine.machineId }] },
        //   });
        //
        //   if (count === 0) {
        //     await this.oeeMachineRepository.create({
        //       oeeId: oee.id,
        //       ...oeeMachine,
        //     });
        //   } else {
        //     await this.oeeMachineRepository.update(
        //       { ...oeeMachine },
        //       {
        //         where: {
        //           [Op.and]: [{ oeeId: oee.id }, { machineId: oeeMachine.machineId }],
        //         },
        //       },
        //     );
        //   }
      }
    }

    return oee;
    // const oee = await this.oeeRepository.findByPk(id);
    // await oee.update({
    //   ...updateDto,
    // });
    //
    // await this.oeeProductRepository.destroy({
    //   where: {
    //     [Op.and]: [
    //       {
    //         oeeId: oee.id,
    //         productId: {
    //           [Op.notIn]: updateDto.oeeProducts
    //             .filter((oeeProduct) => oeeProduct.productId)
    //             .map((oeeProduct) => oeeProduct.productId),
    //         },
    //       },
    //     ],
    //   },
    // });
    //
    // await this.oeeMachineRepository.destroy({
    //   where: {
    //     [Op.and]: [
    //       {
    //         oeeId: oee.id,
    //         machineId: {
    //           [Op.notIn]: updateDto.oeeMachines
    //             .filter((oeeMachine) => oeeMachine.machineId)
    //             .map((oeeMachine) => oeeMachine.machineId),
    //         },
    //       },
    //     ],
    //   },
    // });
    //
    // for (const oeeProduct of updateDto.oeeProducts) {
    //   const count = await this.oeeProductRepository.count({
    //     where: { [Op.and]: [{ oeeId: oee.id }, { productId: oeeProduct.productId }] },
    //   });
    //
    //   if (count === 0) {
    //     await this.oeeProductRepository.create({
    //       oeeId: oee.id,
    //       ...oeeProduct,
    //     });
    //   } else {
    //     await this.oeeProductRepository.update(
    //       { ...oeeProduct },
    //       {
    //         where: {
    //           [Op.and]: [{ oeeId: oee.id }, { productId: oeeProduct.productId }],
    //         },
    //       },
    //     );
    //   }
    // }
    //
    // for (const oeeMachine of updateDto.oeeMachines) {
    //   const count = await this.oeeMachineRepository.count({
    //     where: { [Op.and]: [{ oeeId: oee.id }, { machineId: oeeMachine.machineId }] },
    //   });
    //
    //   if (count === 0) {
    //     await this.oeeMachineRepository.create({
    //       oeeId: oee.id,
    //       ...oeeMachine,
    //     });
    //   } else {
    //     await this.oeeMachineRepository.update(
    //       { ...oeeMachine },
    //       {
    //         where: {
    //           [Op.and]: [{ oeeId: oee.id }, { machineId: oeeMachine.machineId }],
    //         },
    //       },
    //     );
    //   }
    // }
    //
    // if (image) {
    //   const imageUrl = await this.contentService.saveOeeImage(oee.id.toString(), image.buffer, image.mimetype);
    //   await oee.update({ imageUrl });
    // }
    //
    // return oee.reload({ include: [Product, Machine] });
  }

  async delete(id: number, siteId: number): Promise<void> {
    const oee = await this.oeeRepository.findOneBy({ id, siteId });
    oee.deleted = true;
    oee.updatedAt = new Date();
    await this.oeeRepository.save(oee);

    //delete oeeMachinePlannedDowntime
    await this.oeeMachinePlannedDowntimeRepository
      .createQueryBuilder()
      .update()
      .set({ deleted: true, updatedAt: new Date() })
      .where('oeeId = :oeeId', { oeeId: id })
      .execute();
  }

  async deleteMany(ids: number[], siteId: number): Promise<void> {
    const oees = await this.oeeRepository.findBy({ id: In(ids), siteId });
    await this.oeeRepository.save(
      oees.map((oee) => {
        oee.deleted = true;
        oee.updatedAt = new Date();
        return oee;
      }),
    );
    //delete oeeMachinePlannedDowntime
    await this.oeeMachinePlannedDowntimeRepository
      .createQueryBuilder()
      .update()
      .set({ deleted: true, updatedAt: new Date() })
      .where('oeeId in (:ids)', { ids })
      .execute();
  }

  findPlanningsById(id: number, siteId: number): Promise<PlanningEntity[]> {
    return this.planningRepository
      .createQueryBuilder()
      .where('deleted = false')
      .andWhere('oeeId = :oeeId', { oeeId: id })
      .andWhere('siteId = :siteId', { siteId })
      .andWhere('startDate >= :startDate', { startDate: dayjs().startOf('d').toDate() })
      .orderBy('startDate', 'ASC')
      .skip(0)
      .take(5)
      .getMany();
  }
}
