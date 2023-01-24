import { Injectable } from '@nestjs/common';
import { CreatePlanningDto } from './dto/create-planning.dto';
import { UpdatePlanningDto } from './dto/update-planning.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { PlanningEntity } from '../common/entities/planning-entity';
import { FilterPlanningDto } from './dto/filter-planning.dto';
import * as dayjs from 'dayjs';

@Injectable()
export class PlanningService {
  constructor(
    @InjectRepository(PlanningEntity)
    private planningRepository: Repository<PlanningEntity>,
  ) {}

  findByDateRange(filterDto: FilterPlanningDto): Promise<PlanningEntity[]> {
    return this.planningRepository.find({
      where: {
        deleted: false,
        siteId: filterDto.siteId,
        startDate: MoreThanOrEqual(filterDto.start),
        endDate: LessThanOrEqual(filterDto.end),
      },
      order: { startDate: 'asc' },
      relations: ['oee', 'product', 'user'],
    });
  }

  findById(id: number, siteId: number): Promise<PlanningEntity> {
    return this.planningRepository.findOne({
      where: { id, siteId, deleted: false },
    });
  }

  create(createDto: CreatePlanningDto, siteId: number): Promise<PlanningEntity> {
    return this.planningRepository.save({
      ...createDto,
      siteId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(id: number, updateDto: UpdatePlanningDto, siteId: number): Promise<PlanningEntity> {
    const updatingAlarm = await this.planningRepository.findOneBy({ id, siteId });
    return this.planningRepository.save({
      ...updatingAlarm,
      ...updateDto,
      updatedAt: new Date(),
    });
  }

  async delete(id: number, siteId: number): Promise<void> {
    await this.planningRepository.save({
      id,
      siteId,
      deleted: true,
      updatedAt: new Date(),
    });
  }

  async deleteMany(ids: number[], siteId: number): Promise<void> {
    const alarms = await this.planningRepository.findBy({ id: In(ids), siteId });
    await this.planningRepository.save(
      alarms.map((alarm) => {
        alarm.deleted = true;
        alarm.updatedAt = new Date();
        return alarm;
      }),
    );
  }
}
