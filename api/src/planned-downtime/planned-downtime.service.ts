import { Injectable } from '@nestjs/common';
import { CreatePlannedDowntimeDto } from './dto/create-planned-downtime.dto';
import { FilterPlannedDowntimeDto } from './dto/filter-planned-downtime.dto';
import { UpdatePlannedDowntimeDto } from './dto/update-planned-downtime.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PlannedDowntimeEntity } from '../common/entities/planned-downtime-entity';

@Injectable()
export class PlannedDowntimeService {
  constructor(
    @InjectRepository(PlannedDowntimeEntity)
    private plannedDowntimeRepository: Repository<PlannedDowntimeEntity>,
  ) {}

  async findPagedList(filterDto: FilterPlannedDowntimeDto): Promise<PagedLisDto<PlannedDowntimeEntity>> {
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

  async findAll(siteId: number): Promise<PlannedDowntimeEntity[]> {
    return this.plannedDowntimeRepository.findBy({ siteId, deleted: false });
  }

  async findById(id: number, siteId: number): Promise<PlannedDowntimeEntity> {
    return this.plannedDowntimeRepository.findOneBy({ id, siteId, deleted: false });
  }

  create(createDto: CreatePlannedDowntimeDto, siteId: number): Promise<PlannedDowntimeEntity> {
    return this.plannedDowntimeRepository.save({
      ...createDto,
      siteId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(id: number, updateDto: UpdatePlannedDowntimeDto, siteId: number): Promise<PlannedDowntimeEntity> {
    const updatingPlannedDowntime = await this.plannedDowntimeRepository.findOneBy({ id, siteId });
    return this.plannedDowntimeRepository.save({
      ...updatingPlannedDowntime,
      ...updateDto,
      updatedAt: new Date(),
    });
  }

  async delete(id: number, siteId: number): Promise<void> {
    const plannedDowntime = await this.plannedDowntimeRepository.findOneBy({ id, siteId });
    plannedDowntime.deleted = true;
    plannedDowntime.updatedAt = new Date();
    await this.plannedDowntimeRepository.save(plannedDowntime);
  }

  async deleteMany(ids: number[], siteId: number): Promise<void> {
    const plannedDowntimes = await this.plannedDowntimeRepository.findBy({ id: In(ids), siteId });
    await this.plannedDowntimeRepository.save(
      plannedDowntimes.map((plannedDowntime) => {
        plannedDowntime.deleted = true;
        plannedDowntime.updatedAt = new Date();
        return plannedDowntime;
      }),
    );
  }
}
