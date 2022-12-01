import { Injectable } from '@nestjs/common';
import { CreateAlarmDto } from './dto/create-alarm.dto';
import { FilterAlarmDto } from './dto/filter-alarm.dto';
import { UpdateAlarmDto } from './dto/update-alarm.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as _ from 'lodash';
import { Alarm } from '../common/entities/alarm';

@Injectable()
export class AlarmService {
  constructor(
    @InjectRepository(Alarm)
    private alarmRepository: Repository<Alarm>,
  ) {}

  async findPagedList(filterDto: FilterAlarmDto): Promise<PagedLisDto<Alarm>> {
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

  findAll(siteId: number): Promise<Alarm[]> {
    return this.alarmRepository.findBy({ siteId, deleted: false });
  }

  findById(id: number, siteId: number): Promise<Alarm> {
    return this.alarmRepository.findOne({
      where: { id, siteId, deleted: false },
    });
  }

  create(createDto: CreateAlarmDto): Promise<Alarm> {
    return this.alarmRepository.save({
      ...createDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(id: number, updateDto: UpdateAlarmDto): Promise<Alarm> {
    const updatingAlarm = await this.alarmRepository.findOneBy({ id });
    return this.alarmRepository.save({
      ..._.assign(updatingAlarm, updateDto),
      updatedAt: new Date(),
    });
  }

  async delete(id: number): Promise<void> {
    const alarm = await this.alarmRepository.findOneBy({ id });
    alarm.deleted = true;
    alarm.updatedAt = new Date();
    await this.alarmRepository.save(alarm);
  }

  async deleteMany(ids: number[]): Promise<void> {
    const alarms = await this.alarmRepository.findBy({ id: In(ids) });
    await this.alarmRepository.save(
      alarms.map((alarm) => {
        alarm.deleted = true;
        alarm.updatedAt = new Date();
        return alarm;
      }),
    );
  }
}
