import { Injectable } from '@nestjs/common';
import { CreatePlanningDto } from './dto/create-planning.dto';
import { UpdatePlanningDto } from './dto/update-planning.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { merge } from 'lodash';
import { Planning } from '../common/entities/planning';

@Injectable()
export class PlanningService {
  constructor(
    @InjectRepository(Planning)
    private planningRepository: Repository<Planning>,
  ) {}

  findByDateRange(siteId: number, start: Date, end: Date): Promise<Planning[]> {
    return this.planningRepository.find({
      where: { deleted: false, siteId, startDate: MoreThanOrEqual(start), endDate: LessThanOrEqual(end) },
      order: { startDate: 'asc' },
      relations: ['oee', 'product', 'user'],
    });
  }

  findById(id: number, siteId: number): Promise<Planning> {
    return this.planningRepository.findOne({
      where: { id, siteId, deleted: false },
    });
  }

  create(createDto: CreatePlanningDto): Promise<Planning> {
    return this.planningRepository.save({
      oeeId: 1,
      siteId: 1,
      userId: 1,
      ...createDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(id: number, updateDto: UpdatePlanningDto): Promise<Planning> {
    const updatingAlarm = await this.planningRepository.findOneBy({ id });
    return this.planningRepository.save({
      ...merge({}, updatingAlarm, updateDto),
      updatedAt: new Date(),
    });
  }

  async delete(id: number): Promise<void> {
    const alarm = await this.planningRepository.findOneBy({ id });
    alarm.deleted = true;
    alarm.updatedAt = new Date();
    await this.planningRepository.save(alarm);
  }

  async deleteMany(ids: number[]): Promise<void> {
    const alarms = await this.planningRepository.findBy({ id: In(ids) });
    await this.planningRepository.save(
      alarms.map((alarm) => {
        alarm.deleted = true;
        alarm.updatedAt = new Date();
        return alarm;
      }),
    );
  }
}
