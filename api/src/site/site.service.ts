import { Injectable } from '@nestjs/common';
import { CreateSiteDto } from './dto/create-site.dto';
import { FilterSiteDto } from './dto/filter-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SiteEntity } from '../common/entities/site-entity';
import { FileService } from '../common/services/file.service';
import { OptionItem } from '../common/type/option-item';
import { UserEntity } from '../common/entities/user-entity';

@Injectable()
export class SiteService {
  constructor(
    @InjectRepository(SiteEntity)
    private siteRepository: Repository<SiteEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private fileService: FileService,
  ) {}

  async findPagedList(filterDto: FilterSiteDto): Promise<PagedLisDto<SiteEntity>> {
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

  findAll(): Promise<SiteEntity[]> {
    return this.siteRepository.find({ where: { deleted: false } });
  }

  async findOptions(): Promise<OptionItem[]> {
    const list = await this.siteRepository.find({
      where: { deleted: false },
    });

    return list.map((item) => ({ id: item.id, name: item.name }));
  }

  async findUserSites(userId: number): Promise<SiteEntity[]> {
    const user = await this.userRepository.findOneBy({ id: userId });
    return user.isAdmin
      ? this.siteRepository.findBy({ deleted: false })
      : this.siteRepository
          .createQueryBuilder('s')
          .innerJoin('s.users', 'su', 'su.id = :userId', { userId: user.id })
          .where('deleted = false')
          .getMany();
    // const list = await this.userSiteRoleEntityRepository.find({
    //   relations: { site: true },
    //   where: {
    //     userId: userId,
    //     site: {
    //       deleted: false,
    //     },
    //   },
    // });
    //
    // console.log(list);
    //
    // return list.map((item) => item.site);
  }

  findById(id): Promise<SiteEntity> {
    return this.siteRepository.findOne({ where: { id, deleted: false } });
  }

  findDevicesById(id: number): Promise<SiteEntity> {
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

  create(createDto: CreateSiteDto, imageName: string): Promise<SiteEntity> {
    return this.siteRepository.save({
      ...createDto,
      imageName,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(id: number, updateDto: UpdateSiteDto, imageName: string): Promise<SiteEntity> {
    const updatingSite = await this.siteRepository.findOneBy({ id });
    const { imageName: existingImageName } = updatingSite;
    if (imageName && existingImageName) {
      await this.fileService.deleteFile(existingImageName);
    }

    return this.siteRepository.save({
      ...updatingSite,
      ...updateDto,
      imageName: !imageName ? existingImageName : imageName,
      updatedAt: new Date(),
    });
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
