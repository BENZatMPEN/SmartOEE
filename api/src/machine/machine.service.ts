import { Injectable } from '@nestjs/common';
import { CreateMachineDto } from './dto/create-machine.dto';
import { FilterMachineDto } from './dto/filter-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MachineEntity } from '../common/entities/machine-entity';
import { MachineParameterEntity } from '../common/entities/machine-parameter-entity';
import { WidgetEntity } from '../common/entities/widget-entity';
import { FileService } from '../common/services/file.service';
import { MachineWidgetDto } from './dto/machine-widget.dto';

@Injectable()
export class MachineService {
  constructor(
    @InjectRepository(MachineEntity)
    private machineRepository: Repository<MachineEntity>,
    @InjectRepository(MachineParameterEntity)
    private machineParameterRepository: Repository<MachineParameterEntity>,
    @InjectRepository(WidgetEntity)
    private widgetRepository: Repository<WidgetEntity>,
    private readonly fileService: FileService,
  ) {}

  async findPagedList(filterDto: FilterMachineDto): Promise<PagedLisDto<MachineEntity>> {
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

  findAll(siteId: number): Promise<MachineEntity[]> {
    return this.machineRepository.findBy({ siteId, deleted: false });
  }

  findById(id: number, siteId: number): Promise<MachineEntity> {
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

  async create(createDto: CreateMachineDto, imageName: string, siteId: number): Promise<MachineEntity> {
    const { parameters, ...dto } = createDto;
    const machine = await this.machineRepository.save({
      ...dto,
      imageName,
      siteId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (parameters) {
      await this.machineParameterRepository.save(
        parameters.map((param) => {
          const { id, ...paramDto } = param;
          return {
            ...paramDto,
            machineId: machine.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }),
      );
    }

    return machine;
  }

  async update(id: number, updateDto: UpdateMachineDto, imageName: string, siteId: number): Promise<MachineEntity> {
    const { parameters, ...dto } = updateDto;
    const updatingMachine = await this.machineRepository.findOneBy({ id, siteId });
    const { imageName: existingImageName } = updatingMachine;
    if (imageName && existingImageName) {
      await this.fileService.deleteFile(existingImageName);
    }

    const machine = await this.machineRepository.save({
      ...updatingMachine,
      ...dto,
      imageName: !imageName ? existingImageName : imageName,
      updatedAt: new Date(),
    });

    if (parameters && parameters.length >= 0) {
      await this.machineParameterRepository
        .createQueryBuilder()
        .delete()
        .where('machineId = :machineId', { machineId: machine.id })
        .andWhere('id not in (:ids)', { ids: parameters.map((param) => param.id) })
        .execute();

      for (const paramDto of parameters) {
        if (paramDto.id) {
          const updatingMachineParam = await this.machineParameterRepository.findOneBy({ id: paramDto.id });
          await this.machineParameterRepository.save({ ...updatingMachineParam, ...paramDto, updatedAt: new Date() });
        } else {
          await this.machineParameterRepository.save({
            ...paramDto,
            machineId: machine.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
    } else {
      await this.machineParameterRepository
        .createQueryBuilder()
        .delete()
        .where('machineId = :machineId', { machineId: machine.id })
        .execute();
    }

    return machine;
  }

  async delete(id: number, siteId: number): Promise<void> {
    const machine = await this.machineRepository.findOneBy({ id, siteId });
    machine.deleted = true;
    machine.updatedAt = new Date();
    await this.machineRepository.save(machine);
  }

  async deleteMany(ids: number[], siteId: number): Promise<void> {
    const machines = await this.machineRepository.findBy({ id: In(ids), siteId });
    await this.machineRepository.save(
      machines.map((machine) => {
        machine.deleted = true;
        machine.updatedAt = new Date();
        return machine;
      }),
    );
  }

  async saveWidgets(id: number, machineWidgetDto: MachineWidgetDto, siteId: number): Promise<void> {
    const machine = await this.machineRepository.findOneBy({ id, siteId });
    const { widgets } = machineWidgetDto;
    machine.widgets = await Promise.all(
      widgets.map(async (widgetDto) => {
        if (widgetDto.id) {
          const updating = await this.widgetRepository.findOneBy({ id: widgetDto.id });
          return await this.widgetRepository.save({ ...updating, ...widgetDto, updatedAt: new Date() });
        } else {
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
