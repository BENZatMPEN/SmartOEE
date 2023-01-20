import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DashboardEntity } from '../common/entities/dashboard-entity';
import { FilterDashboardDto } from './dto/filter-dashboard.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { CreateDashboardDto } from './dto/create-dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(DashboardEntity)
    private dashboardRepository: Repository<DashboardEntity>,
  ) {}

  async findPagedList(filterDto: FilterDashboardDto): Promise<PagedLisDto<DashboardEntity>> {
    const offset = filterDto.page == 0 ? 0 : filterDto.page * filterDto.rowsPerPage;
    const [rows, count] = await this.dashboardRepository
      .createQueryBuilder()
      .where('deleted = false')
      .andWhere('siteId = :siteId')
      .andWhere(':search is null or title like :search')
      .orderBy(`${filterDto.orderBy}`, filterDto.order === 'asc' ? 'ASC' : 'DESC')
      .skip(offset)
      .take(filterDto.rowsPerPage)
      .setParameters({ siteId: filterDto.siteId, search: filterDto.search ? `%${filterDto.search}%` : null })
      .getManyAndCount();

    return { list: rows, count: count };
  }

  findAll(siteId: number): Promise<DashboardEntity[]> {
    return this.dashboardRepository.find({ where: { siteId, deleted: false } });
  }

  async findById(id: number, siteId: number): Promise<DashboardEntity> {
    return this.dashboardRepository.findOne({ where: { id, siteId, deleted: false } });
  }

  async create(createDto: CreateDashboardDto, siteId: number): Promise<DashboardEntity> {
    return await this.dashboardRepository.save({
      ...createDto,
      siteId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(id: number, updateDto: UpdateDashboardDto, siteId: number): Promise<DashboardEntity> {
    const updatingDashboard = await this.dashboardRepository.findOneBy({ id, siteId });
    return await this.dashboardRepository.save({
      ...updatingDashboard,
      ...updateDto,
      updatedAt: new Date(),
    });
  }

  async delete(id: number, siteId: number): Promise<void> {
    await this.dashboardRepository.createQueryBuilder().delete().where('id = :id', { id }).execute();
  }

  async deleteMany(ids: number[], siteId: number): Promise<void> {
    await this.dashboardRepository.createQueryBuilder().delete().where('id in (:ids)', { ids }).execute();
  }
}
