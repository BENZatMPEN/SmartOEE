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

  async findPagedList(filterDto: FilterHistoryLogDto): Promise<PagedLisDto<HistoryLogEntity>> {
    const offset = filterDto.page == 0 ? 0 : filterDto.page * filterDto.rowsPerPage;
    const [rows, count] = await this.historyLogRepository
      .createQueryBuilder()
      .andWhere('siteId = :siteId', { siteId: filterDto.siteId })
      .andWhere('type = :type', { type: filterDto.type })
      .andWhere('createdAt >= :fromDate and createdAt <= :toDate', {
        fromDate: new Date(filterDto.fromDate),
        toDate: new Date(filterDto.toDate),
      })
      .andWhere(':search is null or message like :search', {
        search: filterDto.search ? `%${filterDto.search}%` : null,
      })
      .orderBy(`${filterDto.orderBy}`, filterDto.order === 'asc' ? 'ASC' : 'DESC')
      .skip(offset)
      .take(filterDto.rowsPerPage)
      .getManyAndCount();

    console.log(rows);
    return { list: rows, count: count };
  }

  async findList(filterDto: FilterHistoryLogDto): Promise<HistoryLogEntity[]> {
    return this.historyLogRepository
      .createQueryBuilder()
      .andWhere('siteId = :siteId', { siteId: filterDto.siteId })
      .andWhere('type = :type', { type: filterDto.type })
      .andWhere('createdAt >= :fromDate and createdAt <= :toDate', {
        fromDate: new Date(filterDto.fromDate),
        toDate: new Date(filterDto.toDate),
      })
      .andWhere(':search is null or message like :search', {
        search: filterDto.search ? `%${filterDto.search}%` : null,
      })
      .orderBy(`${filterDto.orderBy}`, filterDto.order === 'asc' ? 'ASC' : 'DESC')
      .getMany();
  }

  // findAll(siteId: number): Promise<HistoryLog[]> {
  //   return this.historyLogRepository.findBy({ siteId, deleted: false });
  // }
  //
  // findById(id: number, siteId: number): Promise<HistoryLog> {
  //   return this.historyLogRepository.findOne({
  //     where: { id, siteId, deleted: false },
  //   });
  // }
}
