import { Injectable } from '@nestjs/common';
import { CreateDeviceDto } from './dto/create-device.dto';
import { FilterDeviceDto } from './dto/filter-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Device } from '../common/entities/device';
import { DeviceTag } from '../common/entities/device-tag';
import { Site } from '../common/entities/site';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
    @InjectRepository(DeviceTag)
    private deviceTagRepository: Repository<DeviceTag>,
    @InjectRepository(Site)
    private siteRepository: Repository<Site>,
  ) {}

  async findFilter(filterDto: FilterDeviceDto): Promise<PagedLisDto<Device>> {
    const offset = filterDto.page == 0 ? 0 : filterDto.page * filterDto.rowsPerPage;
    const [rows, count] = await this.deviceRepository
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.deviceModel', 'dm')
      .where('d.deleted = false')
      .andWhere('d.siteId = :siteId', { siteId: filterDto.siteId })
      .andWhere(':search is null or d.name like :search or d.remark like :search', {
        search: filterDto.search ? `%${filterDto.search}%` : null,
      })
      .orderBy(`d.${filterDto.orderBy}`, filterDto.order === 'asc' ? 'ASC' : 'DESC')
      .skip(offset)
      .take(filterDto.rowsPerPage)
      .getManyAndCount();

    return { list: rows, count: count };
  }

  findAll(siteId: number): Promise<Device[]> {
    return this.deviceRepository.findBy({ siteId, deleted: false });
  }

  findById(id: number, siteId: number): Promise<Device> {
    // return this.deviceRepository.findOne({
    //   include: [{ model: DeviceTag, include: [DeviceModelTag] }, DeviceModel],
    //   where: { id, deleted: false },
    // });
    return this.deviceRepository.findOne({
      where: { id, siteId, deleted: false },
      relations: ['tags', 'deviceModel'],
    });
  }

  async create(createDto: CreateDeviceDto): Promise<Device> {
    const { tags, ...dto } = createDto;
    const createdDevice = await this.deviceRepository.save({
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.deviceTagRepository.save(
      tags.map((tag) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...tagDto } = tag;
        return {
          ...tagDto,
          deviceId: createdDevice.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }),
    );

    return createdDevice;
  }

  async update(id: number, updateDto: UpdateDeviceDto): Promise<Device> {
    const { tags, ...dto } = updateDto;

    if ((tags || []).length > 0) {
      if (tags.every((tag) => tag.id)) {
        // update tags
        await this.deviceTagRepository.save(
          tags.filter((tag) => tag.id).map((tag) => ({ ...tag, updatedAt: new Date() })),
        );
      } else {
        // create tags
        await this.deviceTagRepository.delete({ deviceId: id });
        await this.deviceTagRepository.save(
          tags.map((tag) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: noId, ...tagDto } = tag;
            return {
              ...tagDto,
              deviceId: id,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
          }),
        );
      }
    }

    const updatedDevice = await this.deviceRepository.save({
      ...dto,
      updatedAt: new Date(),
    });

    // tell the poller to sync the new tags
    await this.siteRepository.save({
      id: updatedDevice.siteId,
      sync: true,
    });

    return updatedDevice;
  }

  async delete(id: number): Promise<void> {
    const device = await this.deviceRepository.findOneBy({ id });
    device.deleted = true;
    device.updatedAt = new Date();
    await this.deviceRepository.save(device);
  }

  async deleteMany(ids: number[]): Promise<void> {
    const devices = await this.deviceRepository.findBy({ id: In(ids) });
    await this.deviceRepository.save(
      devices.map((device) => {
        device.deleted = true;
        device.updatedAt = new Date();
        return device;
      }),
    );
  }
}
