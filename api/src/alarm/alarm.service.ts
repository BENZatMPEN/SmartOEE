import { Injectable } from '@nestjs/common';
import { CreateAlarmDto } from './dto/create-alarm.dto';
import { FilterAlarmDto } from './dto/filter-alarm.dto';
import { UpdateAlarmDto } from './dto/update-alarm.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AlarmEntity } from '../common/entities/alarm-entity';

@Injectable()
export class AlarmService {
  constructor(
    @InjectRepository(AlarmEntity)
    private alarmRepository: Repository<AlarmEntity>,
  ) {}

  async findPagedList(filterDto: FilterAlarmDto): Promise<PagedLisDto<AlarmEntity>> {
    const offset = filterDto.page == 0 ? 0 : filterDto.page * filterDto.rowsPerPage;
    const [rows, count] = await this.alarmRepository
      .createQueryBuilder()
      .where('deleted = false')
      .andWhere('siteId = :siteId', { siteId: filterDto.siteId })
      .andWhere(':search is null or name like :search', {
        search: filterDto.search ? `%${filterDto.search}%` : null,
      })
      .orderBy(`${filterDto.orderBy}`, filterDto.order === 'asc' ? 'ASC' : 'DESC')
      .skip(offset)
      .take(filterDto.rowsPerPage)
      .getManyAndCount();

    return { list: rows, count: count };
  }

  findAll(siteId: number): Promise<AlarmEntity[]> {
    return this.alarmRepository.findBy({ siteId, deleted: false });
  }

  findById(id: number, siteId: number): Promise<AlarmEntity> {
    return this.alarmRepository.findOne({
      where: { id, siteId, deleted: false },
    });
  }

  create(createDto: CreateAlarmDto, siteId: number): Promise<AlarmEntity> {
    return this.alarmRepository.save({
      ...createDto,
      siteId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(id: number, updateDto: UpdateAlarmDto, siteId: number): Promise<AlarmEntity> {
    const updatingAlarm = await this.alarmRepository.findOneBy({ id, siteId });
    return this.alarmRepository.save({
      ...updatingAlarm,
      ...updateDto,
      updatedAt: new Date(),
    });
  }

  async delete(id: number, siteId: number): Promise<void> {
    const alarm = await this.alarmRepository.findOneBy({ id, siteId });
    alarm.deleted = true;
    alarm.updatedAt = new Date();
    await this.alarmRepository.save(alarm);
  }

  async deleteMany(ids: number[], siteId: number): Promise<void> {
    const alarms = await this.alarmRepository.findBy({ id: In(ids), siteId });
    await this.alarmRepository.save(
      alarms.map((alarm) => {
        alarm.deleted = true;
        alarm.updatedAt = new Date();
        return alarm;
      }),
    );
  }
}
