import { Injectable } from '@nestjs/common';
import { CreateAdminSiteDto } from './dto/create-admin-site.dto';
import { FilterAdminSiteDto } from './dto/filter-admin-site.dto';
import { UpdateAdminSiteDto } from './dto/update-admin-site.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SiteEntity } from '../common/entities/site-entity';
import { FileService } from '../common/services/file.service';
import { OptionItem } from '../common/type/option-item';
import { UserEntity } from '../common/entities/user-entity';

@Injectable()
export class AdminSiteService {
  constructor(
    @InjectRepository(SiteEntity)
    private siteRepository: Repository<SiteEntity>,
    private fileService: FileService,
  ) {}

  async findPagedList(filterDto: FilterAdminSiteDto): Promise<PagedLisDto<SiteEntity>> {
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

  async findOptions(): Promise<OptionItem[]> {
    const list = await this.siteRepository.find({
      where: { deleted: false },
    });

    return list.map((item) => ({ id: item.id, name: item.name }));
  }

  findById(id): Promise<SiteEntity> {
    return this.siteRepository.findOne({ where: { id, deleted: false } });
  }

  create(createDto: CreateAdminSiteDto, imageName: string): Promise<SiteEntity> {
    return this.siteRepository.save({
      ...createDto,
      imageName,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(id: number, updateDto: UpdateAdminSiteDto, imageName: string): Promise<SiteEntity> {
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
