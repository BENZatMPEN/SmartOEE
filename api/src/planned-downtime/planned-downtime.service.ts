import { Injectable } from '@nestjs/common';
import { CreatePlannedDowntimeDto } from './dto/create-planned-downtime.dto';
import { FilterPlannedDowntimeDto } from './dto/filter-planned-downtime.dto';
import { UpdatePlannedDowntimeDto } from './dto/update-planned-downtime.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PlannedDowntime } from '../common/entities/planned-downtime';
import * as _ from 'lodash';

@Injectable()
export class PlannedDowntimeService {
  constructor(
    @InjectRepository(PlannedDowntime)
    private plannedDowntimeRepository: Repository<PlannedDowntime>,
  ) {}

  async findPagedList(filterDto: FilterPlannedDowntimeDto): Promise<PagedLisDto<PlannedDowntime>> {
    const offset = filterDto.page == 0 ? 0 : filterDto.page * filterDto.rowsPerPage;
    const [rows, count] = await this.plannedDowntimeRepository
      .createQueryBuilder()
      .where('deleted = false')
      .andWhere('siteId = :siteId', { siteId: filterDto.siteId })
      .andWhere(':search is null or name like :search', { search: filterDto.search ? `%${filterDto.search}%` : null })
      .orderBy(`${filterDto.orderBy}`, filterDto.order === 'asc' ? 'ASC' : 'DESC')
      .skip(offset)
      .take(filterDto.rowsPerPage)
      .getManyAndCount();

    return { list: rows, count: count };
  }

  async findAll(siteId: number): Promise<PlannedDowntime[]> {
    return this.plannedDowntimeRepository.findBy({ siteId, deleted: false });
  }

  async findById(id: number, siteId: number): Promise<PlannedDowntime> {
    return this.plannedDowntimeRepository.findOneBy({ id, siteId, deleted: false });
  }

  create(createDto: CreatePlannedDowntimeDto): Promise<PlannedDowntime> {
    return this.plannedDowntimeRepository.save({
      ...createDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(id: number, updateDto: UpdatePlannedDowntimeDto): Promise<PlannedDowntime> {
    const updatingPlannedDowntime = await this.plannedDowntimeRepository.findOneBy({ id });
    return this.plannedDowntimeRepository.save({
      ..._.assign(updatingPlannedDowntime, updateDto),
      updatedAt: new Date(),
    });
  }

  async delete(id: number): Promise<void> {
    const plannedDowntime = await this.plannedDowntimeRepository.findOneBy({ id });
    plannedDowntime.deleted = true;
    plannedDowntime.updatedAt = new Date();
    await this.plannedDowntimeRepository.save(plannedDowntime);
  }

  async deleteMany(ids: number[]): Promise<void> {
    const plannedDowntimes = await this.plannedDowntimeRepository.findBy({ id: In(ids) });
    await this.plannedDowntimeRepository.save(
      plannedDowntimes.map((plannedDowntime) => {
        plannedDowntime.deleted = true;
        plannedDowntime.updatedAt = new Date();
        return plannedDowntime;
      }),
    );
  }
}
