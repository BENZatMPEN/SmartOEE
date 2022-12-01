import { Injectable } from '@nestjs/common';
import { CreateMachineDto } from './dto/create-machine.dto';
import { FilterMachineDto } from './dto/filter-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { ContentService } from '../common/content/content.service';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Machine } from '../common/entities/machine';
import { MachineParameter } from '../common/entities/machine-parameter';
import * as _ from 'lodash';
import { MachineWidgetDto } from './dto/machine-widget.dto';
import { Widget } from '../common/entities/widget';

@Injectable()
export class MachineService {
  constructor(
    @InjectRepository(Machine)
    private machineRepository: Repository<Machine>,
    @InjectRepository(MachineParameter)
    private machineParameterRepository: Repository<MachineParameter>,
    @InjectRepository(Widget)
    private widgetRepository: Repository<Widget>,
    private readonly contentService: ContentService,
  ) {}

  async findPagedList(filterDto: FilterMachineDto): Promise<PagedLisDto<Machine>> {
    const offset = filterDto.page == 0 ? 0 : filterDto.page * filterDto.rowsPerPage;
    const [rows, count] = await this.machineRepository
      .createQueryBuilder()
      .where('deleted = false')
      .andWhere('siteId = :siteId', { siteId: filterDto.siteId })
      .andWhere(':search is null or name like :search or remark like :search', {
        search: filterDto.search ? `%${filterDto.search}%` : null,
      })
      .orderBy(`${filterDto.orderBy}`, filterDto.order === 'asc' ? 'ASC' : 'DESC')
      .skip(offset)
      .take(filterDto.rowsPerPage)
      .getManyAndCount();

    return { list: rows, count: count };
  }

  findAll(siteId: number): Promise<Machine[]> {
    return this.machineRepository.findBy({ siteId, deleted: false });
  }

  findById(id: number, siteId: number): Promise<Machine> {
    return this.machineRepository.findOne({
      where: { id, siteId, deleted: false },
      relations: {
        parameters: true,
        widgets: true,
      },
    });
  }

  // async findByTagId(tagId: number): Promise<Machine> {
  //   const machineParameter = await this.machineParameterRepository.findOne({
  //     include: [{ model: Machine, include: [OeeMachine] }],
  //     where: { tagId },
  //   });
  //
  //   return machineParameter?.machine;
  //   return null;
  // }

  async create(createDto: CreateMachineDto): Promise<Machine> {
    const { parameters, ...dto } = createDto;
    const machine = await this.machineRepository.save({
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.machineParameterRepository.save(
      parameters.map((param) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...paramDto } = param;
        return {
          ...paramDto,
          machine,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }),
    );

    return machine;

    // const { parameters, ...dto } = createDto;
    // const machine = await this.machineRepository.create({
    //   ...dto,
    // });
    //
    // for (const parameter of parameters) {
    //   await this.machineParameterRepository.create({
    //     machineId: machine.id,
    //     ...parameter,
    //   });
    // }
    //
    // if (image) {
    //   const imageUrl = await this.contentService.saveProductImage(machine.id.toString(), image.buffer, image.mimetype);
    //   await machine.update({ imageUrl });
    // }
    //
    // return machine.reload({ include: [MachineParameter] });
    // return null;
  }

  async update(id: number, updateDto: UpdateMachineDto): Promise<Machine> {
    const { parameters, ...dto } = updateDto;
    const updatingMachine = await this.machineRepository.findOneBy({ id });
    const machine = await this.machineRepository.save({
      ..._.assign(updatingMachine, dto),
      updatedAt: new Date(),
    });

    await this.machineParameterRepository
      .createQueryBuilder()
      .delete()
      .where('machineId = :machineId', { machineId: machine.id })
      .andWhere('id not in (:ids)', { ids: parameters.map((param) => param.id) })
      .execute();

    for (const param of parameters) {
      if (param.id) {
        await this.machineParameterRepository.save({ ...param, updatedAt: new Date() });
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...paramDto } = param;
        await this.machineParameterRepository.save({
          ...paramDto,
          machine,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    return machine;

    // const machine = await this.machineRepository.findByPk(id);
    // const { parameters, ...dto } = updateDto;
    // await machine.update({
    //   ...dto,
    // });
    //
    // await this.machineParameterRepository.destroy({
    //   where: {
    //     [Op.and]: [
    //       {
    //         machineId: machine.id,
    //         id: {
    //           [Op.notIn]: parameters.filter((parameter) => parameter.id).map((parameter) => parameter.id),
    //         },
    //       },
    //     ],
    //   },
    // });
    //
    // for (const parameter of parameters) {
    //   if (parameter.id) {
    //     await this.machineParameterRepository.update({ ...parameter }, { where: { id: parameter.id } });
    //   } else {
    //     await this.machineParameterRepository.create({
    //       machineId: machine.id,
    //       ...parameter,
    //     });
    //   }
    // }
    //
    // if (image) {
    //   const imageUrl = await this.contentService.saveProductImage(machine.id.toString(), image.buffer, image.mimetype);
    //   await machine.update({ imageUrl });
    // }
    //
    // return machine.reload({ include: [MachineParameter] });
    // return null;
  }

  async upload(id: number, image: Express.Multer.File): Promise<void> {
    const machine = await this.machineRepository.findOneBy({ id });
    if (image) {
      machine.imageUrl = await this.contentService.saveMachineImage(
        machine.id.toString(),
        image.buffer,
        image.mimetype,
      );
      await this.machineRepository.save(machine);
    }
  }

  async delete(id: number): Promise<void> {
    const machine = await this.machineRepository.findOneBy({ id });
    machine.deleted = true;
    machine.updatedAt = new Date();
    await this.machineRepository.save(machine);
  }

  async deleteMany(ids: number[]): Promise<void> {
    const machines = await this.machineRepository.findBy({ id: In(ids) });
    await this.machineRepository.save(
      machines.map((machine) => {
        machine.deleted = true;
        machine.updatedAt = new Date();
        return machine;
      }),
    );
  }

  async saveWidgets(id: number, machineWidgetDto: MachineWidgetDto): Promise<void> {
    const machine = await this.machineRepository.findOneBy({ id });
    const { widgets } = machineWidgetDto;
    machine.widgets = await Promise.all(
      widgets.map(async (widget) => {
        if (widget.id) {
          return await this.widgetRepository.save({ ...widget, updatedAt: new Date() });
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...widgetDto } = widget;
          return await this.widgetRepository.save({
            ...widgetDto,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }),
    );

    await this.machineRepository.save(machine);
  }
}
