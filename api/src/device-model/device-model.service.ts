import { Injectable } from '@nestjs/common';
import { CreateDeviceModelDto } from './dto/create-device-model.dto';
import { FilterDeviceModelDto } from './dto/filter-device-model.dto';
import { UpdateDeviceModelDto } from './dto/update-device-model.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { DeviceModel } from '../common/entities/device-model';
import { DeviceModelTag } from '../common/entities/device-model-tag';
import { Site } from '../common/entities/site';
import { Device } from '../common/entities/device';
import { DeviceTag } from '../common/entities/device-tag';

@Injectable()
export class DeviceModelService {
  constructor(
    @InjectRepository(DeviceModel)
    private deviceModelRepository: Repository<DeviceModel>,
    @InjectRepository(DeviceModelTag)
    private deviceModelTagRepository: Repository<DeviceModelTag>,
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
    @InjectRepository(DeviceTag)
    private deviceTagRepository: Repository<DeviceTag>,
    @InjectRepository(Site)
    private siteRepository: Repository<Site>,
  ) {}

  findAll(siteId: number): Promise<DeviceModel[]> {
    return this.deviceModelRepository.findBy({ siteId, deleted: false });
  }

  async findFilter(filterDto: FilterDeviceModelDto): Promise<PagedLisDto<DeviceModel>> {
    const offset = filterDto.page == 0 ? 0 : filterDto.page * filterDto.rowsPerPage;
    const [rows, count] = await this.deviceModelRepository
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

  findById(id: number, siteId: number): Promise<DeviceModel> {
    return this.deviceModelRepository.findOne({
      where: { id, siteId, deleted: false },
      relations: {
        tags: true,
      },
    });
  }

  async create(createDto: CreateDeviceModelDto): Promise<DeviceModel> {
    const { tags, ...dto } = createDto;
    const createdModel = await this.deviceModelRepository.save({
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.deviceModelTagRepository.save(
      tags.map((tag) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, deviceModelId, ...tagDto } = tag;
        return {
          ...tagDto,
          deviceModelId: createdModel.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }),
    );

    return createdModel;
  }

  async update(id: number, updateDto: UpdateDeviceModelDto): Promise<DeviceModel> {
    const { tags, ...dto } = updateDto;
    const updatingDeviceModel = await this.deviceModelRepository.findOneBy({ id });
    const { id: deviceModelId, siteId } = updatingDeviceModel;
    await this.deviceModelTagRepository
      .createQueryBuilder()
      .delete()
      .where('deviceModelId = :deviceModelId', { deviceModelId })
      .andWhere('id not in (:ids)', {
        ids: tags.filter((tag) => tag.id).map((tag) => tag.id),
      })
      .execute();

    // update tags
    await this.deviceModelTagRepository.save(
      tags.filter((tag) => tag.id).map((tag) => ({ ...tag, updatedAt: new Date() })),
    );

    // create tags
    const createdTags = await this.deviceModelTagRepository.save(
      tags
        .filter((tag) => !tag.id)
        .map((tag) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id: noId, deviceModelId: noDeviceModelId, ...tagDto } = tag;
          return {
            ...tagDto,
            deviceModelId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }),
    );

    // find associated devices
    const devices = await this.deviceRepository.find({ where: { deviceModelId: id }, relations: ['tags'] });

    // add the new tags into the associated devices
    for (const device of devices) {
      await this.deviceTagRepository.save(
        createdTags.map((tag) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id: deviceModelTagId, name } = tag;
          return {
            name,
            spLow: 0,
            spHigh: 0,
            updateInterval: '',
            record: false,
            deviceId: device.id,
            deviceModelTagId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }),
      );
    }

    const updatedModel = await this.deviceModelRepository.save({
      ...updatingDeviceModel,
      ...dto,
      updatedAt: new Date(),
    });

    // tell the poller to sync the new tags
    await this.siteRepository.save({
      id: siteId,
      sync: true,
    });

    return updatedModel;
  }

  async delete(id: number): Promise<void> {
    const deviceModel = await this.deviceModelRepository.findOneBy({ id });
    deviceModel.deleted = true;
    deviceModel.updatedAt = new Date();
    await this.deviceModelRepository.save(deviceModel);
  }

  async deleteMany(ids: number[]): Promise<void> {
    const deviceModels = await this.deviceModelRepository.findBy({ id: In(ids) });
    await this.deviceModelRepository.save(
      deviceModels.map((deviceModel) => {
        deviceModel.deleted = true;
        deviceModel.updatedAt = new Date();
        return deviceModel;
      }),
    );
  }
}
