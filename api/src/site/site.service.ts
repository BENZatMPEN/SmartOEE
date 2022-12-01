import { Injectable } from '@nestjs/common';
import { CreateSiteDto } from './dto/create-site.dto';
import { FilterSiteDto } from './dto/filter-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { ContentService } from '../common/content/content.service';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Site } from '../common/entities/site';
import * as _ from 'lodash';
import { User } from '../common/entities/user';

@Injectable()
export class SiteService {
  constructor(
    @InjectRepository(Site)
    private siteRepository: Repository<Site>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly contentService: ContentService,
  ) {}

  async findPagedList(filterDto: FilterSiteDto): Promise<PagedLisDto<Site>> {
    const offset = filterDto.page == 0 ? 0 : filterDto.page * filterDto.rowsPerPage;
    const [rows, count] = await this.siteRepository
      .createQueryBuilder()
      .where('deleted = false')
      .andWhere(':search is null or name like :search or branch like :search')
      .orderBy(`${filterDto.orderBy}`, filterDto.order === 'asc' ? 'ASC' : 'DESC')
      .skip(offset)
      .take(filterDto.rowsPerPage)
      .setParameters({ search: filterDto.search ? `%${filterDto.search}%` : null })
      .getManyAndCount();

    return { list: rows, count: count };
  }

  findAll(): Promise<Site[]> {
    return this.siteRepository.find({ where: { deleted: false } });
  }

  async findByUserId(userId: number): Promise<Site[]> {
    const user = await this.userRepository.findOne({
      relations: { sites: true },
      where: {
        id: userId,
        sites: {
          deleted: false,
        },
      },
    });

    return user?.sites || [];
  }

  findById(id): Promise<Site> {
    return this.siteRepository.findOne({ where: { id, deleted: false } });
  }

  findDevicesById(id: number): Promise<Site> {
    return this.siteRepository.findOne({
      where: { id, deleted: false },
      relations: ['devices', 'devices.tags', 'devices.tags.deviceModelTag', 'devices.deviceModel'],
    });
    // return this.siteRepository.findOne({
    //   include: [
    //     {
    //       model: Device,
    //       include: [
    //         DeviceModel,
    //         {
    //           model: DeviceTag,
    //           include: [DeviceModelTag],
    //         },
    //       ],
    //     },
    //   ],
    //   where: { id, deleted: false },
    // });
    // return null;
  }

  async updateSynced(id: number): Promise<void> {
    const site = await this.siteRepository.findOne({ where: { id, deleted: false } });
    await this.siteRepository.save({
      ...site,
      sync: false,
      updatedAt: new Date(),
    });
  }

  create(createDto: CreateSiteDto): Promise<Site> {
    return this.siteRepository.save({
      ...createDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(id: number, updateDto: UpdateSiteDto): Promise<Site> {
    const updatingSite = await this.siteRepository.findOneBy({ id });
    return this.siteRepository.save({
      ..._.assign(updatingSite, updateDto),
      updatedAt: new Date(),
    });
  }

  async upload(id: number, image: Express.Multer.File): Promise<Site> {
    const site = await this.siteRepository.findOneBy({ id });
    if (image) {
      site.imageUrl = await this.contentService.saveSiteImage(site.id.toString(), image.buffer, image.mimetype);
      await this.siteRepository.save(site);
    }

    return site;
  }

  async delete(id: number): Promise<void> {
    const site = await this.siteRepository.findOneBy({ id });
    site.deleted = true;
    site.updatedAt = new Date();
    await this.siteRepository.save(site);
  }

  async deleteMany(ids: number[]): Promise<void> {
    const sites = await this.siteRepository.findBy({ id: In(ids) });
    await this.siteRepository.save(
      sites.map((site) => {
        site.deleted = true;
        site.updatedAt = new Date();
        return site;
      }),
    );
  }
}
