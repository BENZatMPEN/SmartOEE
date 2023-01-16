import { Injectable } from '@nestjs/common';
import { UpdateSiteDto } from './dto/update-site.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SiteEntity } from '../common/entities/site-entity';
import { FileService } from '../common/services/file.service';
import { UserEntity } from '../common/entities/user-entity';
import { OptionItem } from '../common/type/option-item';

@Injectable()
export class SiteService {
  constructor(
    @InjectRepository(SiteEntity)
    private siteRepository: Repository<SiteEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private fileService: FileService,
  ) {}

  findAll(): Promise<SiteEntity[]> {
    return this.siteRepository.findBy({ deleted: false });
  }

  async findOptions(userId: number): Promise<OptionItem[]> {
    const user = await this.userRepository.findOneBy({ id: userId });
    const sites = user.isAdmin
      ? await this.siteRepository.findBy({ deleted: false })
      : await this.siteRepository
          .createQueryBuilder('s')
          .innerJoin('s.users', 'su', 'su.id = :userId', { userId: user.id })
          .where('deleted = false')
          .getMany();

    return sites.map((item) => ({ id: item.id, name: item.name }));
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
  }

  findById(id): Promise<SiteEntity> {
    return this.siteRepository.findOneBy({ id, deleted: false });
  }

  async findDevicesById(id: number): Promise<SiteEntity> {
    const site = await this.siteRepository.findOne({
      where: { id, deleted: false },
      relations: ['devices', 'devices.tags', 'devices.tags.deviceModelTag', 'devices.deviceModel'],
    });

    if (site) {
      site.devices = site.devices.filter((device) => !device.deleted && device.deviceModel);
    }

    return site;
  }

  async updateSynced(id: number): Promise<void> {
    const site = await this.siteRepository.findOneBy({ id, deleted: false });
    await this.siteRepository.save({
      ...site,
      sync: false,
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
}
