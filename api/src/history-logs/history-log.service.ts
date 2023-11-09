import { Injectable } from '@nestjs/common';
import { FilterHistoryLogDto } from './dto/filter-history-log.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistoryLogEntity } from '../common/entities/history-log.entity';

@Injectable()
export class HistoryLogService {
  constructor(
    @InjectRepository(HistoryLogEntity)
    private historyLogRepository: Repository<HistoryLogEntity>,
  ) {}

  // .createQueryBuilder('u')
  // .leftJoinAndSelect('u.sites', 'us')
  // .where('u.id = :id', { id })
  // .getOne();

  async findPagedList(filterDto: FilterHistoryLogDto): Promise<PagedLisDto<HistoryLogEntity>> {
    const offset = filterDto.page == 0 ? 0 : filterDto.page * filterDto.rowsPerPage;
    const [rows, count] = await this.historyLogRepository
      .createQueryBuilder('hl')
      .leftJoinAndSelect('hl.user', 'u')
      .andWhere('hl.siteId = :siteId', { siteId: filterDto.siteId })
      .andWhere('hl.type = :type', { type: filterDto.type })
      .andWhere('hl.createdAt >= :fromDate and hl.createdAt <= :toDate', {
        fromDate: new Date(filterDto.fromDate),
        toDate: new Date(filterDto.toDate),
      })
      .andWhere(':search is null or hl.message like :search', {
        search: filterDto.search ? `%${filterDto.search}%` : null,
      })
      .orderBy(`hl.${filterDto.orderBy}`, filterDto.order === 'asc' ? 'ASC' : 'DESC')
      .skip(offset)
      .take(filterDto.rowsPerPage)
      .getManyAndCount();

    return { list: rows, count: count };
  }

  async findList(filterDto: FilterHistoryLogDto): Promise<HistoryLogEntity[]> {
    return this.historyLogRepository
      .createQueryBuilder('hl')
      .leftJoinAndSelect('hl.user', 'u')
      .andWhere('hl.siteId = :siteId', { siteId: filterDto.siteId })
      .andWhere('hl.type = :type', { type: filterDto.type })
      .andWhere('hl.createdAt >= :fromDate and hl.createdAt <= :toDate', {
        fromDate: new Date(filterDto.fromDate),
        toDate: new Date(filterDto.toDate),
      })
      .andWhere(':search is null or hl.message like :search', {
        search: filterDto.search ? `%${filterDto.search}%` : null,
      })
      .orderBy(`hl.${filterDto.orderBy}`, filterDto.order === 'asc' ? 'ASC' : 'DESC')
      .getMany();
  }
}
