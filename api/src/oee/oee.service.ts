import { Injectable } from '@nestjs/common';
import { CreateOeeDto } from './dto/create-oee.dto';
import { FilterOeeDto } from './dto/filter-oee.dto';
import { UpdateOeeDto } from './dto/update-oee.dto';
import { ContentService } from '../common/content/content.service';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { Oee } from 'src/common/entities/oee';
import { OeeProduct } from 'src/common/entities/oee-product';
import { OeeMachine } from 'src/common/entities/oee-machine';
import * as _ from 'lodash';
import { OeeBatch } from '../common/entities/oee-batch';
import { OeeStatus, OeeStatusItem } from '../common/type/oee-status';
import { initialOeeBatchStats } from '../common/type/oee-stats';
import { OptionItem } from '../common/type/option-item';

@Injectable()
export class OeeService {
  constructor(
    private readonly contentService: ContentService,
    @InjectRepository(Oee)
    private readonly oeeRepository: Repository<Oee>,
    @InjectRepository(OeeProduct)
    private readonly oeeProductRepository: Repository<OeeProduct>,
    @InjectRepository(OeeMachine)
    private readonly oeeMachineRepository: Repository<OeeMachine>,
    @InjectRepository(OeeBatch)
    private readonly oeeBatchRepository: Repository<OeeBatch>,
    private readonly entityManager: EntityManager,
  ) {}

  async findPagedList(filterDto: FilterOeeDto): Promise<PagedLisDto<Oee>> {
    const offset = filterDto.page == 0 ? 0 : filterDto.page * filterDto.rowsPerPage;
    const [rows, count] = await this.oeeRepository
      .createQueryBuilder()
      .where('deleted = false')
      .andWhere('siteId = :siteId', { siteId: filterDto.siteId })
      .andWhere(
        ':search is null or oeeCode like :search or oeeType like :search or location like :search or remark like :search',
        {
          search: filterDto.search ? `%${filterDto.search}%` : null,
        },
      )
      .orderBy(`${filterDto.orderBy}`, filterDto.order === 'asc' ? 'ASC' : 'DESC')
      .skip(offset)
      .take(filterDto.rowsPerPage)
      .getManyAndCount();

    return { list: rows, count: count };
  }

  findAll(siteId: number): Promise<Oee[]> {
    return this.oeeRepository.find({
      where: { siteId, deleted: false },
      // relations: [
      //   'oeeProducts',
      //   'oeeProducts.product',
      //   'oeeMachines',
      //   'oeeMachines.machine',
      //   'oeeMachines.machine.machineParameters',
      // ],
    });
    // return this.oeeRepository.findAll({
    //   // include: [
    //   //   {
    //   //     model: OeeProduct,
    //   //     include: [Product],
    //   //   },
    //   //   {
    //   //     model: OeeMachine,
    //   //     include: [
    //   //       {
    //   //         model: Machine,
    //   //         include: [MachineParameter],
    //   //       },
    //   //     ],
    //   //   },
    //   // ],
    //   where: { deleted: false },
    // });
  }

  async findOptions(siteId: number): Promise<OptionItem[]> {
    const list = await this.oeeRepository.find({
      select: ['id', 'productionName'],
      where: { siteId, deleted: false },
    });

    return list.map((item) => ({ id: item.id, name: item.productionName }));
  }

  async findAllStatus(siteId: number): Promise<OeeStatus> {
    const rows = await this.entityManager.query(
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
        '       ob.id as oeeBatchId\n' +
        'from oees o\n' +
        '         left join cte on o.id = cte.oeeId\n' +
        '         left join oeeBatches ob\n' +
        '                   on cte.batchId = ob.id\n' +
        'where o.siteId = ? and o.deleted = false',
      [siteId],
    );

    const sumRows = await this.entityManager.query(
      'WITH cte AS (SELECT distinct b.oeeId,\n' +
        '                             first_value(b.id) over (partition by b.oeeId order by b.id desc) as batchId\n' +
        '             FROM oeeBatches AS b)\n' +
        'select ifnull(sum(if(status = "running", 1, 0)), 0)                       as running,\n' +
        '       ifnull(sum(if(status = "ended" or status is null, 1, 0)), 0)       as ended,\n' +
        '       ifnull(sum(if(status = "standby" or status = "planned", 1, 0)), 0) as standby,\n' +
        '       ifnull(sum(if(status = "breakdown", 1, 0)), 0)                     as breakdown\n' +
        'from oees o\n' +
        '         left join cte on o.id = cte.oeeId\n' +
        '         left join oeeBatches ob\n' +
        '                   on cte.batchId = ob.id\n' +
        'where o.siteId = ? and o.deleted = 0;',
      [siteId],
    );

    const { running, ended, standby, breakdown } = sumRows[0];

    return {
      running: running,
      breakdown: breakdown,
      ended: ended,
      standby: standby,
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
        } as OeeStatusItem;
      }),
    } as OeeStatus;
  }

  findByIdIncludingDetails(id: number, siteId: number): Promise<Oee> {
    return this.oeeRepository.findOne({
      where: { id, siteId, deleted: false },
      relations: [
        'oeeProducts',
        'oeeProducts.product',
        'oeeMachines',
        'oeeMachines.machine',
        'oeeMachines.machine.parameters',
      ],
    });
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

  findByIdIncludingProducts(id: number): Promise<OeeProduct[]> {
    return this.oeeProductRepository.find({ where: { oeeId: id }, relations: { product: true } });
  }

  findByIdIncludingMachines(id: number): Promise<OeeMachine[]> {
    return this.oeeMachineRepository.find({
      where: { oeeId: id },
      relations: ['machine', 'machine.parameters'],
    });
  }

  findLatestBatch(id: number): Promise<OeeBatch> {
    return this.oeeBatchRepository.findOne({ where: { oeeId: id }, order: { createdAt: 'DESC' } });
  }

  findById(id: number): Promise<Oee> {
    return this.oeeRepository.findOne({
      where: { id, deleted: false },
    });
  }

  async create(createDto: CreateOeeDto): Promise<Oee> {
    const { oeeProducts, oeeMachines, ...dto } = createDto;
    const oee = await this.oeeRepository.save({
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    for (const product of oeeProducts) {
      await this.oeeProductRepository.save({
        ...product,
        oee,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    for (const machine of oeeMachines) {
      await this.oeeMachineRepository.save({
        ...machine,
        oee,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return oee;
  }

  async update(id: number, updateDto: UpdateOeeDto): Promise<Oee> {
    const { oeeProducts, oeeMachines, ...dto } = updateDto;
    const updatingOee = await this.oeeRepository.findOneBy({ id });
    const oee = await this.oeeRepository.save({
      ..._.assign(updatingOee, dto),
      updatedAt: new Date(),
    });

    await this.oeeProductRepository
      .createQueryBuilder()
      .delete()
      .where('oeeId = :oeeId', { oeeId: oee.id })
      .andWhere('id not in (:ids)', { ids: oeeProducts.map((oeeProduct) => oeeProduct.id) })
      .execute();

    await this.oeeMachineRepository
      .createQueryBuilder()
      .delete()
      .where('oeeId = :oeeId', { oeeId: oee.id })
      .andWhere('id not in (:ids)', { ids: oeeMachines.map((oeeMachine) => oeeMachine.id) })
      .execute();

    for (const oeeProduct of oeeProducts) {
      if (oeeProduct.id) {
        await this.oeeProductRepository.save({ ...oeeProduct, updatedAt: new Date() });
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...oeeProductDto } = oeeProduct;
        await this.oeeProductRepository.save({
          ...oeeProductDto,
          oee,
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

    for (const oeeMachine of oeeMachines) {
      if (oeeMachine.id) {
        await this.oeeMachineRepository.save({ ...oeeMachine, updatedAt: new Date() });
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...oeeMachineDto } = oeeMachine;
        await this.oeeMachineRepository.save({
          ...oeeMachineDto,
          oee,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
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

  async upload(id: number, image: Express.Multer.File): Promise<Oee> {
    const oee = await this.oeeRepository.findOneBy({ id });
    if (image) {
      oee.imageUrl = await this.contentService.saveOeeImage(oee.id.toString(), image.buffer, image.mimetype);
      await this.oeeRepository.save(oee);
    }

    return oee;
  }

  async delete(id: number): Promise<void> {
    const oee = await this.oeeRepository.findOneBy({ id });
    oee.deleted = true;
    oee.updatedAt = new Date();
    await this.oeeRepository.save(oee);
  }

  async deleteMany(ids: number[]): Promise<void> {
    const oees = await this.oeeRepository.findBy({ id: In(ids) });
    await this.oeeRepository.save(
      oees.map((oee) => {
        oee.deleted = true;
        oee.updatedAt = new Date();
        return oee;
      }),
    );
  }
}
